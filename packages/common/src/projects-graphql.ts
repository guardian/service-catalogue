import { stageAwareOctokit } from 'common/src/functions.js';
import type { ProjectId, PullRequestDetails } from 'common/src/types.js';

/*
 ** GitHub's v2 projects API is accessible via GraphQL only.
 ** We could use classic projects and the REST API, but then we would lose
 ** features like PRs moving across the board automatically when their status
 ** changes(i.e. when they are merged).
 */

export function getLastPrsQuery(repoName: string) {
	//It's really unlikely that we'll need to pull as many as 5 PRs,
	//but this is not an expensive query, so we may as well.
	return `{
        organization(login: "guardian") {
          repository(name: "${repoName}") {
            pullRequests(last: 5, states:[OPEN]) {
              nodes {
                author {
                  login
                }
                id
              }
            }
          }
        }
      }`;
}

export function addToProjectQuery(
	projectId: string,
	pullRequestId: string,
): string {
	return `mutation {
		addProjectV2ItemById(input: {projectId: "${projectId}" contentId: "${pullRequestId}"}) {
		  item {
			id
		  }
		}
	  }`;
}

export async function addPrToProject(
	stage: string,
	shortRepoName: string,
	boardNumber: number,
	author: string,
) {
	const graphqlWithAuth = (await stageAwareOctokit(stage)).graphql;

	const projectDetails: ProjectId = await graphqlWithAuth(
		`{
			organization(login: "guardian"){
				projectV2(number: ${boardNumber}) {
				  id
				}
			  }
		  }`,
	);

	const projectId = projectDetails.organization.projectV2.id;

	const prDetails: PullRequestDetails = await graphqlWithAuth(
		getLastPrsQuery(shortRepoName),
	);

	const pullRequestIds = prDetails.organization.repository.pullRequests.nodes
		.filter((pr) => pr.author.login === author)
		.map((pr) => pr.id);

	await Promise.all(
		pullRequestIds.map(async (prId) => {
			await graphqlWithAuth(addToProjectQuery(projectId, prId));
		}),
	);
}
