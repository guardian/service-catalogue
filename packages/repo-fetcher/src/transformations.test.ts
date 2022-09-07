import {findOwnersOfRepo, RepoAndOwner} from "./transformations";
import {RepositoryResponse} from "../../common/github/github"
import { transformRepo, Repository } from "./handler";

describe('repository owners', function () {
    it('should not be returned if none exist for that repo', function () {
        

        expect(findOwnersOfRepo("someRepo", [])).toStrictEqual([])
    });
    it('should be returned only if they exist for that specific repo', function () {
        const owner1 = new RepoAndOwner("team1", "someRepo")
        const owner2 = new RepoAndOwner("team2", "someRepo")
        const owner3 = new RepoAndOwner("team3", "aDifferentRepo")

        const ownerArray = findOwnersOfRepo("someRepo", [owner1, owner2, owner3])

        expect(ownerArray).toStrictEqual(["team1", "team2"])
    });
});


describe('repository objects', function () {
    it('should combine a RepositoryResponse with a list of owners', function () {

        const repo = {
            "id": 123456,
            "node_id": "MDEwOlJlcG9zaXRvcnkxMjk2MjY5",
            "name": "repo-name",
            "full_name": "guardian/repo-name",
            "owner": {
              "login": "guardian",
              "id": 1,
              "node_id": "MDQ6VXNlcjE=",
              "avatar_url": "https://github.com/images/error/octocat_happy.gif",
              "gravatar_id": "",
              "url": "https://api.github.com/users/octocat",
              "html_url": "https://github.com/octocat",
              "followers_url": "https://api.github.com/users/octocat/followers",
              "following_url": "https://api.github.com/users/octocat/following{/other_user}",
              "gists_url": "https://api.github.com/users/octocat/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/octocat/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/octocat/subscriptions",
              "organizations_url": "https://api.github.com/users/octocat/orgs",
              "repos_url": "https://api.github.com/users/octocat/repos",
              "events_url": "https://api.github.com/users/octocat/events{/privacy}",
              "received_events_url": "https://api.github.com/users/octocat/received_events",
              "type": "User",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/guardian/repo-name",
            "description": "This your first repo!",
            "fork": false,
            "url": "https://api.github.com/repos/guardian/repo-name",
            "archive_url": "https://api.github.com/repos/guardian/repo-name/{archive_format}{/ref}",
            "assignees_url": "https://api.github.com/repos/guardian/repo-name/assignees{/user}",
            "blobs_url": "https://api.github.com/repos/guardian/repo-name/git/blobs{/sha}",
            "branches_url": "https://api.github.com/repos/guardian/repo-name/branches{/branch}",
            "collaborators_url": "https://api.github.com/repos/guardian/repo-name/collaborators{/collaborator}",
            "comments_url": "https://api.github.com/repos/guardian/repo-name/comments{/number}",
            "commits_url": "https://api.github.com/repos/guardian/repo-name/commits{/sha}",
            "compare_url": "https://api.github.com/repos/guardian/repo-name/compare/{base}...{head}",
            "contents_url": "https://api.github.com/repos/guardian/repo-name/contents/{+path}",
            "contributors_url": "https://api.github.com/repos/guardian/repo-name/contributors",
            "deployments_url": "https://api.github.com/repos/guardian/repo-name/deployments",
            "downloads_url": "https://api.github.com/repos/guardian/repo-name/downloads",
            "events_url": "https://api.github.com/repos/guardian/repo-name/events",
            "forks_url": "https://api.github.com/repos/guardian/repo-name/forks",
            "git_commits_url": "https://api.github.com/repos/guardian/repo-name/git/commits{/sha}",
            "git_refs_url": "https://api.github.com/repos/guardian/repo-name/git/refs{/sha}",
            "git_tags_url": "https://api.github.com/repos/guardian/repo-name/git/tags{/sha}",
            "git_url": "git:github.com/guardian/repo-name.git",
            "issue_comment_url": "https://api.github.com/repos/guardian/repo-name/issues/comments{/number}",
            "issue_events_url": "https://api.github.com/repos/guardian/repo-name/issues/events{/number}",
            "issues_url": "https://api.github.com/repos/guardian/repo-name/issues{/number}",
            "keys_url": "https://api.github.com/repos/guardian/repo-name/keys{/key_id}",
            "labels_url": "https://api.github.com/repos/guardian/repo-name/labels{/name}",
            "languages_url": "https://api.github.com/repos/guardian/repo-name/languages",
            "merges_url": "https://api.github.com/repos/guardian/repo-name/merges",
            "milestones_url": "https://api.github.com/repos/guardian/repo-name/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/guardian/repo-name/notifications{?since,all,participating}",
            "pulls_url": "https://api.github.com/repos/guardian/repo-name/pulls{/number}",
            "releases_url": "https://api.github.com/repos/guardian/repo-name/releases{/id}",
            "ssh_url": "git@github.com:guardian/repo-name.git",
            "stargazers_url": "https://api.github.com/repos/guardian/repo-name/stargazers",
            "statuses_url": "https://api.github.com/repos/guardian/repo-name/statuses/{sha}",
            "subscribers_url": "https://api.github.com/repos/guardian/repo-name/subscribers",
            "subscription_url": "https://api.github.com/repos/guardian/repo-name/subscription",
            "tags_url": "https://api.github.com/repos/guardian/repo-name/tags",
            "teams_url": "https://api.github.com/repos/guardian/repo-name/teams",
            "trees_url": "https://api.github.com/repos/guardian/repo-name/git/trees{/sha}",
            "clone_url": "https://github.com/guardian/repo-name.git",
            "mirror_url": "git:git.example.com/guardian/repo-name",
            "hooks_url": "https://api.github.com/repos/guardian/repo-name/hooks",
            "svn_url": "https://svn.github.com/guardian/repo-name",
            "homepage": "https://github.com",
            "language": null,
            "forks_count": 9,
            "stargazers_count": 80,
            "watchers_count": 80,
            "size": 108,
            "default_branch": "master",
            "open_issues_count": 0,
            "is_template": false,
            "topics": [
              "production"
            ],
            "has_issues": true,
            "has_projects": true,
            "has_wiki": true,
            "has_pages": false,
            "has_downloads": true,
            "archived": false,
            "disabled": false,
            "visibility": "public",
            "pushed_at": "2011-01-26T19:06:43Z",
            "created_at": "2011-01-26T19:01:12Z",
            "updated_at": "2011-01-26T19:14:43Z",
            "permissions": {
              "admin": false,
              "push": false,
              "pull": true
            },
            "template_repository": null
          }

        const owners = ["team3", "team4"];

        const finalRepoObject: Repository = transformRepo(repo,owners)

        expect(finalRepoObject.owners).toStrictEqual(["team3", "team4"])
        expect(finalRepoObject.name).toStrictEqual("repo-name")
    });
});