package models

type Org struct {
	Name string `json:"name"`
	Id   string `json:"id"`
}

type TagArray []struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type Project struct {
	Id            string   `json:"id"`
	Name          string   `json:"name"`
	Origin        string   `json:"origin"`
	RemoteRepoUrl string   `json:"remoteRepoUrl"`
	Tags          TagArray `json:"tags"`
}
type ProjectResult struct {
	Org      Org
	Projects []Project
}
