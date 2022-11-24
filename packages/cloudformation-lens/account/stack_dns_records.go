package account

import (
	"context"
	"fmt"
	"strings"

	"github.com/aws/aws-sdk-go-v2/service/cloudformation"
	"golang.org/x/exp/slices"
)

func isRecordSet(s string) bool {
	return s == "Guardian::DNS::RecordSet"
}

func containsRecordSetDomain(summary *cloudformation.GetTemplateSummaryOutput) bool {
	recordSetIndex := slices.IndexFunc(summary.ResourceTypes, isRecordSet)

	// Go is unfortunately old school (-1 indicates not found here)
	return recordSetIndex == -1
}

func getRecordSetDomainsFromStackResources(page *cloudformation.ListStackResourcesOutput) []string {
	// Assumes ID of the form riffraff.gutools.co.uk|CNAME|arn:aws:cloudformation:eu-west-1:...:stack/riff-raff-PROD/...|Cnam
	getDomain := func(physicalResourceID string) string {
		parts := strings.Split(physicalResourceID, "|")
		return parts[0]
	}

	domains := []string{}
	for _, resource := range page.StackResourceSummaries {
		if isRecordSet(*resource.ResourceType) {
			domains = append(domains, getDomain(*resource.PhysicalResourceId))
		}
	}

	return domains
}

func getRecordSetDomainsForStack(client *cloudformation.Client, stackName string) ([]string, error) {
	paginator := cloudformation.NewListStackResourcesPaginator(client, &cloudformation.ListStackResourcesInput{
		StackName: &stackName,
	})

	domains := []string{}
	for paginator.HasMorePages() {
		page, err := paginator.NextPage(context.Background())
		if err != nil {
			return domains, fmt.Errorf("unable to get next page of stack resources for stack %s: %v", stackName, err)
		}

		domains = append(domains, getRecordSetDomainsFromStackResources(page)...)
	}

	return domains, nil
}

func getRecordSetDomains(client *cloudformation.Client, summary *cloudformation.GetTemplateSummaryOutput, stackName *string) ([]string, error) {
	domains := []string{}
	if !containsRecordSetDomain(summary) {
		recordSetDomains, err := getRecordSetDomainsForStack(client, *stackName)

		if err != nil {
			return nil, err
		}

		domains = append(domains, recordSetDomains...)
	}

	return domains, nil
}
