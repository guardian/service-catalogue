import { stageAwareGraphQlClient } from 'common/functions';
import type { SnykIntegratorEvent } from 'common/types';
import type { ProjectId, PullRequestDetails } from './types';

/*
 ** GitHub's v2 projects API is accessible via GraphQL only.
 ** We could use classic projects and the REST API, but then we would lose
 ** features like PRs moving across the board automatically when their status
 ** changes(i.e. when they are merged).
 */

//TODO test me
 function getLastPrsQuery(repoName: string) {
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

export async function addPrToProject(
	stage: string,
	event: SnykIntegratorEvent,
) {
	const graphqlWithAuth = await stageAwareGraphQlClient(stage);

	const projectDetails: ProjectId = await graphqlWithAuth(
		`{
			organization(login: "guardian"){
				projectV2(number: 110) {
				  id
				}
			  }
		  }`,
	);

	const projectId = projectDetails.organization.projectV2.id;
	console.log(projectId);

	//TODO can we filter this to only PRs raised by gu-snyk-integrator?
	const prDetails: PullRequestDetails = await graphqlWithAuth(
		getLastPrsQuery(event.name),
	);

	const pullRequestIds = prDetails.organization.repository.pullRequests.nodes
		.filter((pr) => pr.author.login === 'gu-snyk-integrator')
		.map((pr) => pr.id);

	console.log(pullRequestIds);

	const addToProjectString = `mutation {
		addProjectV2ItemById(input: {projectId: "${projectId}" contentId: "${pullRequestIds[0]}"}) {
		  item {
			id
		  }
		}
	  }`;

	return addToProjectString;
}
