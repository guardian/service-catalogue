package models

type OrgsResult struct {
	Orgs []struct {
		Id   string `json:"id"`
		Slug string `json:"slug"`
	}
}
