package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"time"
	"unicode"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/guardian/cdk-metadata/account"
	"github.com/guardian/cdk-metadata/prism"
	"github.com/guardian/cdk-metadata/store"
)

var bucket string = os.Getenv("BUCKET")

func crawl(ctx context.Context, accounts []account.Account, store store.Store, dryRun bool) error {
	stacks := []account.Stack{}
	for _, account := range accounts {
		resp, err := account.GetStacks()
		if err != nil {
			log.Printf("unable to crawl account %s: %v", account.GetAccountID(), err)
			continue
		}

		stacks = append(stacks, resp...)
	}

	out, err := json.Marshal(stacks)
	check(err, "unable to marshal stacks")

	if dryRun {
		log.Println(string(out))
		return nil
	}

	date := time.Now().Format("2006-01-02")
	err = store.Put(bucket, fmt.Sprintf("cdk-stack-metadata-%s.json", date), out)
	check(err, "unable to write dated object to S3")

	err = store.Put(bucket, "cdk-stack-metadata-latest.json", out)
	check(err, "unable to write 'latest' object to S3")

	return err
}

func check(err error, msg string) {
	if err != nil {
		log.Fatalf("%s; %v", msg, err)
	}
}

func getAccountForProfile(profile string) (prism.Account, error) {
	// abcDef -> abc-def (basic version).
	snakeCase := func(s string) string {
		out := ""

		for _, rune := range s {
			if unicode.IsUpper(rune) {
				out += "-"
			}

			out += string(unicode.ToLower(rune))
		}

		return out
	}

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

func handleLocalRequest(profile string) {
	prismAccount, err := getAccountForProfile(profile)
	check(err, "unable to find prism account for profile")

	acc, err := account.NewFromProfile(profile, prismAccount.ID, prismAccount.Name)
	check(err, fmt.Sprintf("unable to build account for profile %s (note: requires VPN connection)", profile))

	var localStore store.LocalStore = map[string][]byte{}

	crawl(context.Background(), []account.Account{acc}, localStore, true)
}

func handleLambdaRequest(ctx context.Context, event events.CloudWatchEvent) (string, error) {
	prismAccounts, err := prism.GetAccounts()
	check(err, "unable to fetch accounts from Prism")

	accounts := []account.Account{}
	for _, accountMeta := range prismAccounts {
		arn := fmt.Sprintf("arn:aws:iam::%s:role/cdk-metadata-access", accountMeta.ID)
		acc, err := account.NewFromAssumedRole(arn, accountMeta.ID, accountMeta.Name)
		check(err, fmt.Sprintf("unable to build account for arn '%s'", arn))

		accounts = append(accounts, acc)
	}

	s3Store, err := store.NewS3()
	check(err, "unable to construct S3 store")

	return "", crawl(ctx, accounts, s3Store, false)
}

func main() {
	var profile = flag.String("profile", "", "Set to use a specific profile when testing locally.")
	flag.Parse()

	if *profile != "" {
		handleLocalRequest(*profile)
		return
	}

	lambda.Start(handleLambdaRequest)
}
