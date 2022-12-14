package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
	"unicode"

	"github.com/gorilla/mux"

	"github.com/guardian/cloudformation-lens/account"
	"github.com/guardian/cloudformation-lens/cache"
	"github.com/guardian/cloudformation-lens/prism"
	"github.com/guardian/cloudformation-lens/store"
)

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

func gorillaWalkFn(allRoutes *[]string) mux.WalkFunc {
	return func(route *mux.Route, router *mux.Router, ancestors []*mux.Route) error {
		path, err := route.GetPathTemplate()
		if err != nil {
			return err
		}
		*allRoutes = append(*allRoutes, path)
		return err
	}
}

func getRoutes(router *mux.Router) ([]string, error) {
	var allRoutes []string
	err := router.Walk(gorillaWalkFn(&allRoutes))
	return allRoutes, err
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

	// Set to true to crawl even when today's data is already present. Note,
	// this doesn't disable caching though.
	ForceCrawl bool
}

func crawlAccounts(opts CrawlOptions) {
	date := time.Now().Format("2006-01-02")
	fileForToday := fmt.Sprintf("data-%s.json", date)

	_, _, err := opts.Store.Get(fileForToday)
	if !opts.ForceCrawl && err == nil {
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

	err = opts.Store.Put(fmt.Sprintf("data-%s.json", date), out)
	if err != nil {
		log.Printf("unable to write dated object to S3: %v", err)
		return
	}

	err = opts.Store.Put("data-latest.json", out)
	if err != nil {
		log.Printf("unable to write 'latest' object to S3: %v", err)
		return
	}
}

func logDuration(fn func(), name string) {
	log.Printf("timer - %s starting...", name)
	start := time.Now()
	fn()
	log.Printf("timer - %s complete in %v.", name, time.Since(start))
}

func schedule(ticker <-chan time.Time, f func()) {
	logDuration(f, "crawl")

	for range ticker {
		logDuration(f, "crawl")
	}
}

func rootHandler(allRoutes []string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// prepend host
		absoluteRoutes := []string{}
		for _, path := range allRoutes {
			absoluteRoutes = append(absoluteRoutes, fmt.Sprintf("http://%s%s", r.Host, path))
		}

		allRoutesJson, err := json.Marshal(absoluteRoutes)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "unable to marshal routes: %v", err)
			return
		}
		w.Header().Add("content-type", "application/json")
		fmt.Fprintln(w, string(allRoutesJson))
	}
}

// 200 "OK"
func healthcheckHandler(w http.ResponseWriter, _ *http.Request) {
	_, _ = fmt.Fprintln(w, "OK")
}

func stackHandler(store store.Store) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		data, _, err := store.Get("data-latest.json")
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "unable to read latest stack data: %v", err)
			return
		}

		w.Header().Add("content-type", "application/json")
		w.Write(data)
	}
}

func getBucket() (string, error) {
	got, ok := os.LookupEnv("BUCKET")
	if !ok || got == "" {
		return "", errors.New("BUCKET env var is missing or empty")
	}

	return got, nil
}

func main() {
	profile := flag.String("profile", "", "Set to use a specific profile when testing locally.")
	inMemory := flag.Bool("in-memory", false, "Set when you want to read/write to an in-memory store rather than S3")
	forceCrawl := flag.Bool("force-crawl", false, "Set when you want to force a crawl even if today's data has been set (note, the serviceCache will still be used though where appropriate). This flag is ignored when '-in-memory' is set.")
	crawlFrequency := flag.String("crawl-frequency", "24h", "Use to override e.g. for local testing. See time.ParseDuration for valid values.")
	noCrawl := flag.Bool("no-crawl", false, "Do not crawl.")
	flag.Parse()

	var s store.Store
	if *inMemory {
		s = store.LocalStore(map[string]store.LocalRecord{})
	} else if *profile != "" {
		bucket, err := getBucket()
		check(err, "missing bucket env var")

		s, err = store.NewS3FromProfile(bucket, *profile)
		check(err, "unable to create S3 store for profile")
	} else {
		bucket, err := getBucket()
		check(err, "missing bucket env var")

		s, err = store.NewS3(bucket)
		check(err, "unable to create S3 store")
	}

	serviceCache := cache.New(s)

	var accounts []account.Account
	if *profile != "" {
		prismAccount, err := getAccountForProfile(*profile)
		check(err, "unable to find prism account for profile")

		acc, err := account.NewFromProfile(*profile, prismAccount.ID, prismAccount.Name, serviceCache)
		check(err, fmt.Sprintf("unable to build account for profile %s (note: requires VPN connection)", *profile))

		accounts = append(accounts, acc)
	} else {
		prismAccounts, err := prism.GetAccounts()
		check(err, "unable to fetch accounts from Prism")

		for _, accountMeta := range prismAccounts {
			arn := fmt.Sprintf("arn:aws:iam::%s:role/cloudformation-read-access", accountMeta.ID)
			acc, err := account.NewFromAssumedRole(arn, accountMeta.ID, accountMeta.Name, serviceCache)
			check(err, fmt.Sprintf("unable to build account for arn '%s'", arn))

			accounts = append(accounts, acc)
		}
	}

	frequency, err := time.ParseDuration(*crawlFrequency)
	check(err, "unable to parse crawl frequency")
	opts := CrawlOptions{Profile: *profile, InMemory: *inMemory, Store: s, Accounts: accounts, ForceCrawl: *forceCrawl}
	ticker := time.NewTicker(frequency).C

	if !*noCrawl {
		go schedule(ticker, func() { crawlAccounts(opts) })
	}

	router := mux.NewRouter()
	router.HandleFunc("/healthcheck", healthcheckHandler)
	router.HandleFunc("/stacks", stackHandler(s))

	//gather all routes already defined
	allRoutes, err := getRoutes(router)
	check(err, "unable to get routes")

	router.HandleFunc("/", rootHandler(allRoutes))

	http.Handle("/", router)

	log.Println("Server is running on http://localhost:8900...")
	log.Fatal(http.ListenAndServe(":8900", nil))
}
