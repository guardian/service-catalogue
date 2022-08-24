package main

import (
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
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation/types"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	dynamoTypes "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/sts"
)

type Role struct {
	OwnerID string
	ARN     string
}

type Config struct {
	Config struct {
		Roles []Role
	}
}

type Stack struct {
	StackName string `json:"stackName"`
	Account   string `json:"account"`
	Metadata  string `json:"metadata"`
}

type Target struct {
	Account string
	Config  aws.Config
}

var bucket string = os.Getenv("BUCKET")

func targetsFromRoles(ctx context.Context, stsClient *sts.Client, roles []Role) ([]Target, error) {
	targets := []Target{}

	for _, role := range roles {
		provider := stscreds.NewAssumeRoleProvider(stsClient, role.ARN)
		cfg, err := config.LoadDefaultConfig(ctx, config.WithCredentialsProvider(provider))
		if err != nil {
			return targets, fmt.Errorf("unable to build config for role %s: %v", role.OwnerID, err)
		}

		targets = append(targets, Target{Account: role.OwnerID, Config: cfg}) // TODO fix account to be actual number.
	}

	return targets, nil
}

func targetsFromProfile(profile string) ([]Target, error) {
	targets := []Target{}

	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithSharedConfigProfile(profile), config.WithRegion("eu-west-1"))
	if err != nil {
		return targets, fmt.Errorf("unable to build config for profile %s: %v", profile, err)
	}

	targets = append(targets, Target{Account: profile, Config: cfg})
	return targets, err
}

func crawl(ctx context.Context, profile string) error {
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

	dynamodbClient := dynamodb.NewFromConfig(globalConfig)
	items, err := dynamodbClient.Query(ctx, &dynamodb.QueryInput{
		TableName:                 aws.String("config-deploy"),
		KeyConditionExpression:    aws.String("App = :app AND Stage = :stage"),
		ExpressionAttributeValues: map[string]dynamoTypes.AttributeValue{":app": &dynamoTypes.AttributeValueMemberS{Value: "cdk-metadata"}, ":stage": &dynamoTypes.AttributeValueMemberS{Value: "INFRA"}},
	})
	check(err, "unable to load roles from Dynamodb")

	rolesConfig := Config{}
	err = attributevalue.UnmarshalMap(items.Items[0], &rolesConfig)
	check(err, "unable to unmarshal roles from Dynamob")

	stsClient := sts.NewFromConfig(globalConfig)

	var targets []Target

	switch profile {
	case "":
		targets, err = targetsFromRoles(ctx, stsClient, rolesConfig.Config.Roles)
		log.Printf("Targets are: %v", targets)
		check(err, "unable to get targets from roles")
	default:
		targets, err = targetsFromProfile(profile)
		check(err, "unable to get targets from profile")
	}

	stacks := []Stack{}
	for _, target := range targets {
		log.Printf("Scanning account: %s...", target.Account)

		cfnClient := cloudformation.NewFromConfig(target.Config)
		paginator := cloudformation.NewDescribeStacksPaginator(cfnClient, &cloudformation.DescribeStacksInput{})

		hasMorePages := true

		for hasMorePages {
			page, err := paginator.NextPage(ctx)
			check(err, "unable to get Cloudformation next page for account: "+target.Account)

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
	return "", crawl(ctx, "")
}

func main() {
	var profile = flag.String("profile", "", "Set to use a specific profile when testing locally.")
	flag.Parse()

	if *profile != "" {
		crawl(context.Background(), *profile)
		return
	}

	lambda.Start(HandleRequest)
}
