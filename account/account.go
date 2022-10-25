package account

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials/stscreds"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation/types"
	"github.com/aws/aws-sdk-go-v2/service/sts"
)

type Stack struct {
	StackName   string         `json:"stackName"`
	Metadata    map[string]any `json:"metadata"`
	AccountID   string         `json:"accountId"`
	AccountName string         `json:"accountName"`
}

type Account interface {
	GetStacks() ([]Stack, error)
	GetAccountID() string
	GetAccountName() string
}

func NewFromProfile(profile string, ID string, name string) (AWSAccount, error) {
	ctx := context.Background()
	conf, err := config.LoadDefaultConfig(ctx, config.WithSharedConfigProfile(profile), config.WithRegion("eu-west-1"))
	if err != nil {
		return AWSAccount{}, err
	}

	return AWSAccount{Config: conf, AccountID: ID, AccountName: name}, nil
}

func NewFromAssumedRole(roleARN string, ID string, name string) (AWSAccount, error) {
	ctx := context.Background()
	conf, err := config.LoadDefaultConfig(ctx, config.WithRegion("eu-west-1"))
	if err != nil {
		return AWSAccount{}, err
	}

	stsClient := sts.NewFromConfig(conf)
	provider := stscreds.NewAssumeRoleProvider(stsClient, roleARN)
	assumedRoleConf, err := config.LoadDefaultConfig(ctx, config.WithCredentialsProvider(provider), config.WithRegion("eu-west-1"))
	if err != nil {
		return AWSAccount{}, err
	}

	return AWSAccount{Config: assumedRoleConf, AccountID: ID, AccountName: name}, nil
}

type AWSAccount struct {
	Config                 aws.Config
	AccountID, AccountName string
}

func (a AWSAccount) GetAccountID() string {
	return a.AccountID
}

func (a AWSAccount) GetAccountName() string {
	return a.AccountName
}

func (a AWSAccount) GetStacks() ([]Stack, error) {
	ctx := context.Background()
	client := cloudformation.NewFromConfig(a.Config)
	return getStacks(ctx, client, a.AccountName, a.AccountID)
}

func getStacks(ctx context.Context, client *cloudformation.Client, accountName string, accountID string) ([]Stack, error) {
	stacks := []Stack{}

	paginator := cloudformation.NewDescribeStacksPaginator(client, &cloudformation.DescribeStacksInput{})

	hasMorePages := true

	for hasMorePages {
		page, err := paginator.NextPage(ctx)
		if err != nil {
			return stacks, fmt.Errorf("unable to get next page of stack info: %v", err)
		}

		for _, stackSummary := range page.Stacks {
			if stackSummary.StackStatus == types.StackStatusDeleteComplete {
				continue
			}

			stackName := stackSummary.StackName
			input := &cloudformation.GetTemplateSummaryInput{StackName: stackName}
			summary, err := client.GetTemplateSummary(ctx, input)
			if err != nil {
				log.Printf("unable to get template summary for stack %s: %v", *stackName, err)
				continue
			}

			metadata := getString(summary.Metadata, "{}")
			metadataMap := map[string]any{}
			err = json.Unmarshal([]byte(metadata), &metadataMap)
			if err != nil {
				log.Printf("unable to get template metadata for stack '%s' and metadata '%s': %v", *stackName, metadata, err)
				continue
			}

			stacks = append(stacks, Stack{StackName: *stackName, AccountName: accountName, AccountID: accountID, Metadata: metadataMap})
		}

		hasMorePages = paginator.HasMorePages()
	}

	return stacks, nil
}

func getString(ptr *string, defaultValue string) string {
	if ptr != nil {
		return *ptr
	}

	return defaultValue
}
