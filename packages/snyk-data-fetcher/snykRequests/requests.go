package snykRequests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"snyk-data-fetcher/models"
)

func SnykRequest[A any](method string, path string, headers http.Header, reqBody string) (A, error) {
	var a A
	bodyBytes := []byte(reqBody)

	url := "https://api.snyk.io/api/v1/" + path
	req, err := http.NewRequest(method, url, bytes.NewBuffer(bodyBytes))
	req.Header = headers

	resp, err := http.DefaultClient.Do(req)
	if resp.StatusCode != 200 {
		return a, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}
	if err != nil {
		log.Println("Error on response.\n[ERROR] -", err)
		return a, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error while reading the response bytes:", err)
		return a, err
	}

	err = json.Unmarshal(body, &a)
	if err != nil {
		return a, err
	}

	return a, nil
}

func GetOrgs(snykGroupId string, headers http.Header) (models.OrgsResult, error) {

	path := "group/" + snykGroupId + "/orgs"
	orgsResult, err := SnykRequest[models.OrgsResult](http.MethodGet, path, headers, "")
	if err != nil {
		return models.OrgsResult{}, err
	} else {
		return orgsResult, err
	}
}

func GetProjectsForOrg(orgId string, token string) (models.ProjectResult, error) {
	authHeader := http.Header{"Authorization": {"token " + token}}
	return SnykRequest[models.ProjectResult](http.MethodGet, "org/"+orgId+"/projects", authHeader, "")
}

func UrgentAggregatedIssuesForProject(orgId string, projectId string, token string) (models.Issues, error) {
	path := "org/" + orgId + "/project/" + projectId + "/aggregated-issues"
	headers := http.Header{"Authorization": {"token " + token}, "Content-Type": {"application/json"}}
	body := "{\"filters\": {\"severities\": [\"critical\", \"high\" ]}}"
	return SnykRequest[models.Issues](http.MethodPost, path, headers, body)
}
