package account

import (
	"reflect"
	"testing"

	"github.com/aws/aws-sdk-go-v2/service/cloudformation"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation/types"
)

func TestGetRecordSetDomainsFromStackResources(t *testing.T) {
	want := []string{"riffraff.gutools.co.uk"}

	recordSetResourceType := "Guardian::DNS::RecordSet"
	stackResourceString := "riffraff.gutools.co.uk|CNAME|arn:aws:cloudformation:eu-west-1:...:stack/riff-raff-PROD/...|Cname"

	resourceSummary := types.StackResourceSummary{ResourceType: &recordSetResourceType, PhysicalResourceId: &stackResourceString}
	resourceSummaryList := []types.StackResourceSummary{resourceSummary}
	page := cloudformation.ListStackResourcesOutput{StackResourceSummaries: resourceSummaryList}
	got := getRecordSetDomainsFromStackResources(&page)

	if !reflect.DeepEqual(want, got) {
		t.Fatalf("got %s; want %s", got, want)
	}
}
