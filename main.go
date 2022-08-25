package main

import (
	"bytes"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials/stscreds"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation/types"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/sts"
)

// Account describes an AWS account.
type Account struct {
	ID   string `json:"accountId"`
	Name string `json:"accountName"`
}

// Target is an account with Config (credentials).
type Target struct {
	Account
	Config aws.Config
}

// Stack is a Cloudformation stack with metadata.
type Stack struct {
	StackName string `json:"stackName"`
	Metadata  string `json:"metadata"`
	Account
}

var bucket string = os.Getenv("BUCKET")

var accounts []Account = []Account{
	{Name: "capi", ID: "308506855511"},
	{Name: "deployTools", ID: "095768028460"},
}

func accountForProfile(profile string, accounts []Account) (Account, error) {
	for _, account := range accounts {
		if account.Name == profile {
			return account, nil
		}
	}

	return Account{}, fmt.Errorf("unable to find account for profile %s", profile)
}

func targetsForAccounts(ctx context.Context, stsClient *sts.Client, accounts []Account) ([]Target, error) {
	targets := []Target{}

	for _, account := range accounts {
		roleARN := fmt.Sprintf("arn:aws:iam::%s:role/cdk-metadata-access", account.ID)
		provider := stscreds.NewAssumeRoleProvider(stsClient, roleARN)
		cfg, err := config.LoadDefaultConfig(ctx, config.WithCredentialsProvider(provider))
		if err != nil {
			return targets, fmt.Errorf("unable to build config for role %s: %v", account.Name, err)
		}

		targets = append(targets, Target{Account: account, Config: cfg})
	}

	return targets, nil
}

func targetForProfile(profile string, account Account) (Target, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithSharedConfigProfile(profile), config.WithRegion("eu-west-1"))
	if err != nil {
		return Target{}, fmt.Errorf("unable to build config for profile %s: %v", profile, err)
	}

	return Target{Account: account, Config: cfg}, nil
}

func crawl(ctx context.Context, accounts []Account, profile string) error {
	dryRun := profile != "" // Print output when running locally rather than writing to S3.

	var globalConfig aws.Config
	var err error

	if profile != "" {
		globalConfig, err = config.LoadDefaultConfig(ctx, config.WithSharedConfigProfile("deployTools"), config.WithRegion("eu-west-1"))
		check(err, "unable to load AWS config")
	} else {
		globalConfig, err = config.LoadDefaultConfig(ctx, config.WithRegion("eu-west-1"))
		check(err, "unable to load AWS config")
	}

	stsClient := sts.NewFromConfig(globalConfig)

	var targets []Target

	switch profile {
	case "":
		targets, err = targetsForAccounts(ctx, stsClient, accounts)
		log.Printf("Targets are: %v", targets)
		check(err, "unable to get targets from roles")
	default:
		account, err := accountForProfile(profile, accounts)
		check(err, "unable to match profile to account")

		target, err := targetForProfile(profile, account)
		check(err, "unable to get targets from profile")

		targets = []Target{target}
	}

	stacks := []Stack{}
	for _, target := range targets {
		log.Printf("Scanning account: %s...", target.Account.ID)

		cfnClient := cloudformation.NewFromConfig(target.Config)
		paginator := cloudformation.NewDescribeStacksPaginator(cfnClient, &cloudformation.DescribeStacksInput{})

		hasMorePages := true

		for hasMorePages {
			page, err := paginator.NextPage(ctx)
			check(err, "unable to get Cloudformation next page for account: "+target.Account.ID)

			for _, stackSummary := range page.Stacks {
				if stackSummary.StackStatus == types.StackStatusDeleteComplete {
					continue
				}

				stackName := stackSummary.StackName
				input := &cloudformation.GetTemplateSummaryInput{StackName: stackName}
				summary, err := cfnClient.GetTemplateSummary(ctx, input)
				if err != nil {
					log.Printf("unable to get template summary for stack %s: %v", *stackName, err)
					continue
				}

				stacks = append(stacks, Stack{StackName: *stackName, Account: target.Account, Metadata: getString(summary.Metadata, "missing")})
			}

			hasMorePages = paginator.HasMorePages()
		}
	}

	out, err := json.Marshal(stacks)
	check(err, "unable to marshal stacks")

	if dryRun {
		log.Println(string(out))
		return nil
	}

	s3Client := s3.NewFromConfig(globalConfig)
	date := time.Now().Format("2006-01-02")
	key := fmt.Sprintf("cdk-stack-metadata-%s.json", date)

	_, err = s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: &bucket,
		Key:    &key,
		Body:   bytes.NewBuffer(out),
	})

	return err
}

func getString(ptr *string, defaultValue string) string {
	if ptr != nil {
		return *ptr
	}

	return defaultValue
}

func check(err error, msg string) {
	if err != nil {
		log.Fatalf("%s; %v", msg, err)
	}
}

func HandleRequest(ctx context.Context, event events.CloudWatchEvent) (string, error) {
	return "", crawl(ctx, accounts, "")
}

func main() {
	var profile = flag.String("profile", "", "Set to use a specific profile when testing locally.")
	flag.Parse()

	if *profile != "" {
		crawl(context.Background(), accounts, *profile)
		return
	}

	lambda.Start(HandleRequest)
}
