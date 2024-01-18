import { stageAwareGraphQlClient } from 'common/functions';
import type { SnykIntegratorEvent } from 'common/types';
import type { ProjectId, PullRequestDetails } from './types';

function getLastPrsQuery(repoName: string, last: number) {
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
		getLastPrsQuery(event.name, 5),
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
