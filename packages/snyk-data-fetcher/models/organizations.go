package models

type OrgIdAndSlug struct {
	Id   string `json:"id"`
	Slug string `json:"slug"`
}
type OrgsResult struct {
	Orgs []OrgIdAndSlug
}
