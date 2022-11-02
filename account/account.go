package account

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials/stscreds"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation/types"
	"github.com/aws/aws-sdk-go-v2/service/sts"
	"github.com/guardian/cdk-metadata/cache"
	"golang.org/x/exp/slices"
)

type Features struct {
	GuardianCDKVersion    *string  `json:"guardianCdkVersion"`
	GuardianDNSRecordSets []string `json:"guardianDnsRecordSets"`
}

type Stack struct {
	StackName    string            `json:"stackName"`
	Metadata     map[string]any    `json:"metadata"`
	AccountID    string            `json:"accountId"`
	AccountName  string            `json:"accountName"`
	Tags         map[string]string `json:"tags"`
	DevxFeatures Features          `json:"devxFeatures"`
}

func (s Stack) Marshal() ([]byte, error) {
	return json.Marshal(s)
}

func (s *Stack) Unmarshal(data []byte) error {
	return json.Unmarshal(data, s)
}

type Account interface {
	GetStacks() ([]Stack, error)
	GetAccountID() string
	GetAccountName() string
}

func NewFromProfile(profile string, ID string, name string, cache cache.Cache) (AWSAccount, error) {
	ctx := context.Background()
	conf, err := config.LoadDefaultConfig(ctx, config.WithSharedConfigProfile(profile), config.WithRegion("eu-west-1"))
	if err != nil {
		return AWSAccount{}, err
	}

	return AWSAccount{Config: conf, AccountID: ID, AccountName: name, Cache: cache}, nil
}

func NewFromAssumedRole(roleARN string, ID string, name string, cache cache.Cache) (AWSAccount, error) {
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

	return AWSAccount{Config: assumedRoleConf, AccountID: ID, AccountName: name, Cache: cache}, nil
}

type AWSAccount struct {
	Config                 aws.Config
	AccountID, AccountName string
	Cache                  cache.Cache
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
	return getStacks(ctx, client, a.Cache, a.AccountName, a.AccountID)
}

func getOrElse[A any](a *A, b A) A {
	if a != nil {
		return *a
	}

	return b
}

func getStacks(ctx context.Context, client *cloudformation.Client, cache cache.Cache, accountName string, accountID string) ([]Stack, error) {
	getStackJSON := func(stackSummary types.Stack) ([]byte, error) {
		stackName := stackSummary.StackName
		input := &cloudformation.GetTemplateSummaryInput{StackName: stackName}
		summary, err := client.GetTemplateSummary(ctx, input)
		if err != nil {
			return nil, fmt.Errorf("unable to get template summary for stack %s: %w", *stackName, err)
		}

		metadata := getString(summary.Metadata, "{}")
		metadataMap := map[string]any{}
		err = json.Unmarshal([]byte(metadata), &metadataMap)
		if err != nil {
			return nil, fmt.Errorf("unable to get template metadata for stack '%s' and metadata '%s': %w", *stackName, metadata, err)
		}

		tags := tagsAsMap(stackSummary.Tags)

		recordSetDomains, err := getRecordSetDomains(client, *stackName, summary)
		if err != nil {
			return nil, fmt.Errorf("unable to get record sets for stack '%s': %w", *stackName, err)
		}

		stack := Stack{
			StackName:   *stackName,
			AccountName: accountName,
			AccountID:   accountID,
			Metadata:    metadataMap,
			Tags:        tags,
			DevxFeatures: Features{
				GuardianCDKVersion:    guardianCDKVersion(tags, metadataMap),
				GuardianDNSRecordSets: recordSetDomains,
			},
		}

		return stack.Marshal()
	}

	stacks := []Stack{}
	paginator := cloudformation.NewDescribeStacksPaginator(client, &cloudformation.DescribeStacksInput{})

	for paginator.HasMorePages() {
		page, err := paginator.NextPage(ctx)
		if err != nil {
			return stacks, fmt.Errorf("unable to get next page of stack info: %v", err)
		}

		for _, stackSummary := range page.Stacks {
			if stackSummary.StackStatus == types.StackStatusDeleteComplete {
				continue
			}

			cacheKey := fmt.Sprintf("%s/%s/%s", accountID, "eu-west-1", *stackSummary.StackName)
			modifiedAt := getOrElse(stackSummary.LastUpdatedTime, *stackSummary.CreationTime)

			got, err := cache.WithCache(cacheKey, modifiedAt, func() ([]byte, error) { return getStackJSON(stackSummary) })
			if err != nil {
				log.Printf("error getting stack data from cache: %v", err)
				continue
			}

			var s Stack
			err = s.Unmarshal(got)
			if err != nil {
				log.Printf("error unmarshalling stack from cache")
			}

			stacks = append(stacks, s)
		}
	}

	return stacks, nil
}

// Guardian CDK version can be in tags or metadata, though going forward
// metadata is preferred.
func guardianCDKVersion(tags map[string]string, metadata map[string]any) *string {
	key := "gu:cdk:version"
	version, ok := tags[key]
	if ok {
		return &version
	}

	metadataVersion, ok := metadata[key]
	if ok {
		strMetadataVersion, ok := metadataVersion.(string) // cast to string (safely) required as metadata isn't strongly typed here.
		if ok {
			return &(strMetadataVersion)
		}

	}

	return nil
}

func getRecordSetDomains(client *cloudformation.Client, stackName string, summary *cloudformation.GetTemplateSummaryOutput) ([]string, error) {
	isRecordSet := func(s string) bool {
		return s == "Guardian::DNS::RecordSet"
	}

	// Assumes ID of the form riffraff.gutools.co.uk|CNAME|arn:aws:cloudformation:eu-west-1:...:stack/riff-raff-PROD/...|Cnam
	getDomain := func(physicalResourceID string) string {
		parts := strings.Split(physicalResourceID, "|")
		return parts[0]
	}

	recordSetIndex := slices.IndexFunc(summary.ResourceTypes, isRecordSet)

	if recordSetIndex == -1 { // Go is unfortunately old school (-1 indicates not found here).
		return []string{}, nil
	}

	paginator := cloudformation.NewListStackResourcesPaginator(client, &cloudformation.ListStackResourcesInput{
		StackName: &stackName,
	})

	domains := []string{}
	for paginator.HasMorePages() {
		page, err := paginator.NextPage(context.Background())
		if err != nil {
			return domains, fmt.Errorf("unable to get next page of stack resources for stack %s: %v", stackName, err)
		}

		for _, resource := range page.StackResourceSummaries {
			if isRecordSet(*resource.ResourceType) {
				domains = append(domains, getDomain(*resource.PhysicalResourceId))
			}
		}
	}

	return domains, nil
}

func tagsAsMap(tags []types.Tag) map[string]string {
	out := map[string]string{}

	for _, tag := range tags {
		out[*tag.Key] = *tag.Value
	}

	return out
}

func getString(ptr *string, defaultValue string) string {
	if ptr != nil {
		return *ptr
	}

	return defaultValue
}
