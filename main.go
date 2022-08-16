package main

import (
	"context"
	"log"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation/types"
)

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

	ctx := context.Background()
	stacks := []Stack{}

	cfg, err := config.LoadDefaultConfig(ctx, config.WithSharedConfigProfile("deployTools"), config.WithRegion("eu-west-1"))
	if err != nil {
		log.Fatal(err)
	}

	cfnClient := cloudformation.NewFromConfig(cfg)
	//s3Client := s3.NewFromConfig(cfg)

	output, err := cfnClient.ListStacks(ctx, &cloudformation.ListStacksInput{})
	if err != nil {
		log.Printf("Unable to list stacks for account %s: %v", "deployTools", err)
		return
	}

	for _, stackSummary := range output.StackSummaries {
		if stackSummary.StackStatus == types.StackStatusDeleteComplete {
			continue
		}

		stackName := stackSummary.StackName
		input := &cloudformation.GetTemplateSummaryInput{StackName: stackName}
		summary, err := cfnClient.GetTemplateSummary(ctx, input)
		if err != nil {
			log.Printf("Unable to get template summary for stack %s: %v", *stackName, err)
			continue
		}

		stacks = append(stacks, Stack{StackName: *stackName, Account: "TODO", Metadata: getString(summary.Metadata, "missing")})
	}

	log.Printf("%v", stacks)
}

func getString(ptr *string, defaultValue string) string {
	if ptr != nil {
		return *ptr
	}

	return defaultValue
}
