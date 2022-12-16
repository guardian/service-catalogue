package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

type OrgsResult struct {
	Orgs []struct {
		Id   string `json:"id"`
		Slug string `json:"slug"`
	}
}

type Issues struct {
	IssuesArray []struct {
		PkgName string `json:"pkgName"`
	}
}

func snykRequest[A any](method string, path string, headers http.Header, reqBody string) (A, error) {
	var a A
	payloadBuf := new(bytes.Buffer)
	json.NewEncoder(payloadBuf).Encode(reqBody)
	url := "https://api.snyk.io/api/v1/" + path
	req, err := http.NewRequest(method, url, payloadBuf)
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

type Org struct {
	Name string `json:"name"`
	Id   string `json:"id"`
}

type TagArray []struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type ProjectArray []struct {
	Id            string   `json:"id"`
	Name          string   `json:"name"`
	Origin        string   `json:"origin"`
	RemoteRepoUrl string   `json:"remoteRepoUrl"`
	Tags          TagArray `json:"tags"`
}
type ProjectResult struct {
	Org      Org
	Projects ProjectArray
}

func extractOrgIds(orgsResult OrgsResult) []string {

	var result []string
	for _, s := range orgsResult.Orgs {
		result = append(result, s.Id)
	}
	return result
}
func getOrgs(snykGroupId string, headers http.Header) ([]string, error) {
	path := "group/" + snykGroupId + "/orgs"
	orgsResult, err := snykRequest[OrgsResult](http.MethodGet, path, headers, "")
	if err != nil {
		return []string{}, err
	} else {
		return extractOrgIds(orgsResult), err
	}
}

func main() {
	//TODO put these two variables in env config
	snykGroupId := os.Getenv("SNYK_GROUP_ID")
	snykToken := os.Getenv("SNYK_API_KEY")
	headers := http.Header{"Authorization": {"token " + snykToken}}

	orgIds, _ := getOrgs(snykGroupId, headers)
	projects, _ := snykRequest[ProjectResult](http.MethodGet, "org/"+orgIds[1]+"/projects", headers, "")

	fmt.Println(projects.Projects[0])

}
