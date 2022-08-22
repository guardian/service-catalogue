package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

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

func targetsFromRoles(stsClient *sts.Client, roles []Role) ([]Target, error) {
	targets := []Target{}

	for _, role := range roles {
		provider := stscreds.NewAssumeRoleProvider(stsClient, role.ARN)
		cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithCredentialsProvider(provider))
		if err != nil {
			return targets, fmt.Errorf("unable to build config for role %s: %v", role.OwnerID, err)
		}

		targets = append(targets, Target{Account: role.OwnerID, Config: cfg})
	}

	return targets, nil
}

func targetsFromProfile(profile string) ([]Target, error) {
	targets := []Target{}

	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithSharedConfigProfile(profile), config.WithRegion("eu-west-1"))
	if err != nil {
		return targets, fmt.Errorf("unable to build config for profile %s: %v", profile, err)
	}

	targets = append(targets, Target{Account: "deployTools", Config: cfg})
	return targets, err
}

func main() {
	// Steps:
	// [x] get metadata
	// [x] across accounts
	// [ ] switch to lambda on cron schedule
	// [ ]

	// TODO get via env vars
	profile := "deployTools"
	dryRun := true

	ctx := context.Background()

	globalConfig, err := config.LoadDefaultConfig(ctx, config.WithSharedConfigProfile("deployTools"), config.WithRegion("eu-west-1"))
	check(err, "unable to load AWS config")

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
		targets, err = targetsFromRoles(stsClient, rolesConfig.Config.Roles)
		check(err, "unable to get targets from roles")
	default:
		targets, err = targetsFromProfile(profile)
		check(err, "unable to get targets from profile")
	}

	stacks := []Stack{}
	for _, target := range targets {
		cfnClient := cloudformation.NewFromConfig(target.Config)
		paginator := cloudformation.NewListStacksPaginator(cfnClient, &cloudformation.ListStacksInput{})

		for paginator.HasMorePages() {
			page, err := paginator.NextPage(ctx)
			if err != nil {
				log.Printf("unable to read page for account %s: %v", "TODO", err)
			}

			for _, stackSummary := range page.StackSummaries {
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

				stacks = append(stacks, Stack{StackName: *stackName, Account: "TODO", Metadata: getString(summary.Metadata, "missing")})
			}
		}
	}

	out, err := json.Marshal(stacks)
	if err != nil {
		log.Fatalf("unable to marshal stacks: %v", err)
	}

	switch dryRun {
	case true:
		log.Println(string(out))
	case false:
		s3Client := s3.NewFromConfig(globalConfig)
		s3Client.PutObject(ctx, &s3.PutObjectInput{
			Bucket: aws.String("TODO"),
			Key:    aws.String("cdk-stack-metadata.json"),
		})

	}

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
