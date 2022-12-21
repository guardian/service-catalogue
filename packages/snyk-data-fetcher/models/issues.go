package models

type pathArray []struct {
	Name       string `json:"name"`
	Version    string `json:"version"`
	FixVersion string `json:"fixVersion"`
}
type IssuePath struct {
	SnapshotId string      `json:"snapshotId"`
	Paths      []pathArray `json:"paths"`
}

type Issue struct {
	Id          string   `json:"id"`
	PkgName     string   `json:"pkgName"`
	PkgVersions []string `json:"pkgVersions"`
	IssueData   struct {
		Severity string `json:"severity"`
	}
	FixInfo struct {
		IsUpgradable       bool     `json:"isUpgradable"`
		IsFixable          bool     `json:"isFixable"`
		IsPartiallyFixable bool     `json:"isPartiallyFixable"`
		FixedIn            []string `json:"fixedIn"`
	}
}
type Issues struct {
	Issues []Issue
}

type ProjectAndIssues struct {
	Org     Org
	Project Project
	Issues  Issues
}
