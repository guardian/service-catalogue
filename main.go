package main

import (
	"context"
	"encoding/json"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation/types"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	dynamoTypes "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type Role struct {
	OwnerID string
	Role    string
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

func main() {
	// list stacks
	// get metadata
	// store and push to s3 once per day
	// when requested, return the data

	// load roles from Dynamo

	ctx := context.Background()
	stacks := []Stack{}

	cfg, err := config.LoadDefaultConfig(ctx, config.WithSharedConfigProfile("deployTools"), config.WithRegion("eu-west-1"))
	if err != nil {
		log.Fatalf("unable to load AWS config: %v", err)
	}

	dynamodbClient := dynamodb.NewFromConfig(cfg)
	items, err := dynamodbClient.Query(ctx, &dynamodb.QueryInput{
		TableName:                 aws.String("config-deploy"),
		KeyConditionExpression:    aws.String("App = :app AND Stage = :stage"),
		ExpressionAttributeValues: map[string]dynamoTypes.AttributeValue{":app": &dynamoTypes.AttributeValueMemberS{Value: "cdk-metadata"}, ":stage": &dynamoTypes.AttributeValueMemberS{Value: "INFRA"}},
	})

	if err != nil {
		log.Fatalf("unable to load roles from dynamo: %v", err)
	}

	rolesConfig := Config{}
	err = attributevalue.UnmarshalMap(items.Items[0], &rolesConfig)

	if err != nil {
		log.Fatalf("unable to unmarshal roles from dynamo: %v", err)
	}

	log.Printf("%v", rolesConfig)

	return // Temp

	cfnClient := cloudformation.NewFromConfig(cfg)
	//s3Client := s3.NewFromConfig(cfg)

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

	out, err := json.Marshal(stacks)
	if err != nil {
		log.Fatalf("unable to marshal stacks: %v", err)
	}

	log.Println(string(out))
}

func getString(ptr *string, defaultValue string) string {
	if ptr != nil {
		return *ptr
	}

	return defaultValue
}
