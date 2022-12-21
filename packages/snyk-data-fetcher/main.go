package main

import (
	"encoding/json"
	"github.com/repeale/fp-go"
	"log"
	"net/http"
	"net/url"
	"os"
	"snyk-data-fetcher/models"
	"snyk-data-fetcher/snykRequests"
	"strings"
	"sync"
)

var wg sync.WaitGroup

func check(err error, msg string) {
	if err != nil {
		log.Fatalf("%s; %v", msg, err)
	}
}

type StorageData struct {
	OrgID       string
	OrgName     string
	ProjectID   string
	ProjectName string
	RepoURL     string
	RepoName    string
	Issues      []models.Issue
}

func getRepoNameFromURL(s string) string {
	u, err := url.Parse(s)
	if err != nil {
		return ""
	}
	nameAndSuffix := strings.ReplaceAll(u.Path, "/guardian/", "")
	name := strings.ReplaceAll(nameAndSuffix, ".git", "")
	return name
}

func writeRepoIssuesToJson(orgID string, snykToken string) {
	defer wg.Done()
	projectsWithoutIssues, err := snykRequests.GetProjectsForOrg(orgID, snykToken)
	if err != nil {
		log.Printf("Could not find projects in org %s", orgID)
	}
	for _, p := range projectsWithoutIssues {
		issues, err := snykRequests.UrgentAggregatedIssuesForProject(p.Org.Id, p.Project.Id, snykToken)
		if err != nil {
			log.Printf("Could not find issues for %s", p.Project.Name)
			continue
		}

		storageItem := StorageData{
			OrgID:       p.Org.Id,
			OrgName:     p.Org.Name,
			ProjectID:   p.Project.Id,
			ProjectName: p.Project.Name,
			RepoURL:     p.Project.RemoteRepoUrl,
			RepoName:    getRepoNameFromURL(p.Project.RemoteRepoUrl),
			Issues:      issues.Issues,
		}

		file, jsonError := json.MarshalIndent(storageItem, "", "  ")
		if jsonError != nil {
			log.Printf("Could not marshall %s to json", p.Project.Name)
		}

		if storageItem.RepoName != "" && storageItem.RepoName != "null" {
			directoryName := storageItem.RepoName
			// ignore the error
			_ = os.Mkdir(directoryName, os.ModePerm)
			filePath := directoryName + "/" + storageItem.ProjectID + ".json"
			writeError := os.WriteFile(filePath, file, 0644)
			if writeError != nil {
				log.Println(writeError)
			}
			if len(issues.Issues) > 0 {
				log.Printf("found %d critical or high severity issues in %s - %s", len(issues.Issues), storageItem.RepoName, storageItem.ProjectName)
			}
		}

	}
}

func main() {
	//TODO put these two variables in env config
	snykGroupId := os.Getenv("SNYK_GROUP_ID")
	snykToken := os.Getenv("SNYK_API_KEY")
	authHeader := http.Header{"Authorization": {"token " + snykToken}}

	orgResult, err := snykRequests.GetOrgs(snykGroupId, authHeader)
	check(err, "Failed to retrieve Organizations from Snyk")
	log.Printf("Found %d Snyk organizations", len(orgResult.Orgs))
	orgs := orgResult.Orgs
	wg.Add(len(orgs))

	orgIds := fp.Map(func(x models.OrgIdAndSlug) string {
		return x.Id
	})(orgs)

	for _, orgID := range orgIds {
		go writeRepoIssuesToJson(orgID, snykToken)
	}

	wg.Wait()

}
