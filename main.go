package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
	"unicode"

	"github.com/guardian/cdk-metadata/account"
	"github.com/guardian/cdk-metadata/prism"
	"github.com/guardian/cdk-metadata/store"
)

var bucket string = os.Getenv("BUCKET")

// check is a crude way to fail fast. Only use it for errors that should halt
// the entire app - e.g. missing configuration. For the core crawling logic we
// should never fail but instead log the error and do our best to continue
// crawling other stacks/accounts.
func check(err error, msg string) {
	if err != nil {
		log.Fatalf("%s; %v", msg, err)
	}
}

// abcDef -> abc-def (basic version).
func snakeCase(s string) string {
	out := ""

	for _, rune := range s {
		if unicode.IsUpper(rune) {
			out += "-"
		}

		out += string(unicode.ToLower(rune))
	}

	return out
}

func getAccountForProfile(profile string) (prism.Account, error) {
	accounts, err := prism.GetAccounts()
	if err != nil {
		return prism.Account{}, err
	}

	for _, account := range accounts {
		if account.Name == snakeCase(profile) {
			return account, nil
		}
	}

	return prism.Account{}, fmt.Errorf("unable to find account for profile: %s", profile)
}

type CrawlOptions struct {
	// (A Janus) profile can be passed when running locally as an alternative to
	// assume role.
	Profile string

	// InMemory controls whether to use an in-memory store for data. When false
	// (the default), S3 is used.
	InMemory bool

	// Store to write to
	Store store.Store

	// Accounts to query
	Accounts []account.Account
}

func crawlAccounts(opts CrawlOptions) {
	date := time.Now().Format("2006-01-02")
	fileForToday := fmt.Sprintf("cdk-stack-metadata-%s.json", date)

	_, err := opts.Store.Get(bucket, fileForToday)
	if err == nil && !opts.InMemory {
		log.Println("skipping crawl as record for today already exists. To force a re-crawl, delete today's file and redeploy.")
		return
	}

	stacks := []account.Stack{}
	for _, account := range opts.Accounts {
		resp, err := account.GetStacks()
		if err != nil {
			log.Printf("unable to crawl account %s: %v", account.GetAccountID(), err)
			continue
		}

		stacks = append(stacks, resp...)
	}

	out, err := json.Marshal(stacks)
	if err != nil {
		log.Printf("unable to marshal stacks in JSON: %v", err)
		return
	}

	err = opts.Store.Put(bucket, fmt.Sprintf("cdk-stack-metadata-%s.json", date), out)
	if err != nil {
		log.Printf("unable to write dated object to S3: %v", err)
		return
	}

	err = opts.Store.Put(bucket, "cdk-stack-metadata-latest.json", out)
	if err != nil {
		log.Printf("unable to write 'latest' object to S3: %v", err)
		return
	}
}

func schedule(ticker <-chan time.Time, f func()) {
	log.Println("Initial tick...")
	f()

	for range ticker {
		log.Println("Subsequent tick...")
		f()
	}
}

// 200 "OK"
func healthcheckHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "OK")
}

func stackHandler(store store.Store) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		data, err := store.Get(bucket, "cdk-stack-metadata-latest.json")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "unable to read latest stack data: %v", err)
			return
		}

		w.Header().Add("content-type", "application/json")
		w.Write(data)
	}
}

func main() {
	profile := flag.String("profile", "", "Set to use a specific profile when testing locally.")
	inMemory := flag.Bool("in-memory", false, "Set when you want to read/write to an in-memory store rather than S3")
	flag.Parse()

	var s store.Store
	if *inMemory {
		s = store.LocalStore(map[string][]byte{})
	} else {
		var err error
		s, err = store.NewS3()
		check(err, "unable to create S3 store")
	}

	var accounts []account.Account
	if *profile != "" {
		prismAccount, err := getAccountForProfile(*profile)
		check(err, "unable to find prism account for profile")

		acc, err := account.NewFromProfile(*profile, prismAccount.ID, prismAccount.Name)
		check(err, fmt.Sprintf("unable to build account for profile %s (note: requires VPN connection)", *profile))

		accounts = append(accounts, acc)
	} else {
		prismAccounts, err := prism.GetAccounts()
		check(err, "unable to fetch accounts from Prism")

		for _, accountMeta := range prismAccounts {
			arn := fmt.Sprintf("arn:aws:iam::%s:role/cloudformation-read-access", accountMeta.ID)
			acc, err := account.NewFromAssumedRole(arn, accountMeta.ID, accountMeta.Name)
			check(err, fmt.Sprintf("unable to build account for arn '%s'", arn))

			accounts = append(accounts, acc)
		}
	}

	opts := CrawlOptions{Profile: *profile, InMemory: *inMemory, Store: s, Accounts: accounts}
	ticker := time.NewTicker(time.Hour * 24).C

	go schedule(ticker, func() { crawlAccounts(opts) })

	http.Handle("/healthcheck", http.HandlerFunc(healthcheckHandler))
	http.Handle("/stacks", http.HandlerFunc(stackHandler(s)))

	log.Println("Server is running on http://localhost:8900...")
	log.Fatal(http.ListenAndServe(":8900", nil))
}
