package main

import (
	"fmt"
	"net/http"
	"os"
	"snyk-data-fetcher/models"
	"snyk-data-fetcher/snykRequests"
)

func main() {
	//TODO put these two variables in env config
	snykGroupId := os.Getenv("SNYK_GROUP_ID")
	snykToken := os.Getenv("SNYK_API_KEY")
	authHeader := http.Header{"Authorization": {"token " + snykToken}}

	fmt.Println("\n----ORG IDS----")
	orgIds, _ := snykRequests.GetOrgs(snykGroupId, authHeader)
	fmt.Println(orgIds)

	fmt.Println("\n----A PROJECT IN AN ORG----")
	orgId := orgIds.Orgs[1].Id
	projects, _ := snykRequests.GetProjectsForOrg(orgId, snykToken)
	project := projects.Projects[3]
	fmt.Println(project)

	fmt.Println("\n----FIRST ISSUE IN PROJECT----")
	projectId := project.Id
	issuesForProject, _ := snykRequests.UrgentAggregatedIssuesForProject(orgId, projectId, snykToken)
	fmt.Println(issuesForProject.Issues[0])

	fmt.Println("\n----ISSUE PATHS----")
	path := "org/" + orgId + "/project/" + projectId + "/history/latest/issue/" + issuesForProject.Issues[0].Id + "paths"

	res, err := snykRequests.SnykRequest[models.IssuePath](http.MethodGet, path, http.Header{"Authorization": {"token " + snykToken}}, "")
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println(res)
	}
}
