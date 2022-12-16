package main

import (
	"fmt"
	"github.com/davecgh/go-spew/spew"
	"github.com/repeale/fp-go"
	"log"
	"net/http"
	"os"
	"snyk-data-fetcher/models"
	"snyk-data-fetcher/snykRequests"
)

func check(err error, msg string) {
	if err != nil {
		log.Fatalf("%s; %v", msg, err)
	}
}

type ProjectAndIssues struct {
	Org     models.Org
	Project models.Project
	Issues  models.Issues
}

type StorageData struct {
	orgID     string
	orgName   string
	projectID string
	repoURL   string
	issueData models.Issues
}

func transformProjectWithIssues(proj ProjectAndIssues) StorageData {

	return StorageData{
		orgID:     proj.Org.Id,
		orgName:   proj.Org.Name,
		projectID: proj.Project.Id,
		repoURL:   proj.Project.RemoteRepoUrl,
		issueData: proj.Issues,
	}
}

func main() {
	//TODO put these two variables in env config
	snykGroupId := os.Getenv("SNYK_GROUP_ID")
	snykToken := os.Getenv("SNYK_API_KEY")
	authHeader := http.Header{"Authorization": {"token " + snykToken}}

	fmt.Println("\n----ORG IDS----")
	orgs, err := snykRequests.GetOrgs(snykGroupId, authHeader)
	check(err, "Failed to retrieve Organizations from Snyk")
	fmt.Println(orgs)

	var projectResults []models.ProjectResult
	for _, org := range orgs.Orgs[5:6] {
		projects, err := snykRequests.GetProjectsForOrg(org.Id, snykToken)
		if err != nil {
			log.Printf("Failed to fetch org: %s, id %s", org.Slug, org.Id)
			continue
		}
		projectResults = append(projectResults, projects)
	}
	fmt.Println("\n----PROJECTS WITH ISSUES----")
	allProjectsWithIssues := []ProjectAndIssues{}
	for _, result := range projectResults[:1] {
		for _, project := range result.Projects {
			issues, err := snykRequests.UrgentAggregatedIssuesForProject(result.Org.Id, project.Id, snykToken)
			if err != nil {
				log.Printf("Failed to fetch issues for project: %s, id %s", project.Name, project.Id)
				continue
			}
			allProjectsWithIssues = append(allProjectsWithIssues, ProjectAndIssues{result.Org, project, issues})
		}

	}
	rs := fp.Map(func(p ProjectAndIssues) StorageData { return transformProjectWithIssues(p) })(allProjectsWithIssues)
	spew.Dump(rs[:3])

	//TODO generate the repo name, generate the link to snyk, store the output to json

}
