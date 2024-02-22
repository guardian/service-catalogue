import type { github_repositories, github_workflows } from '@prisma/client';

type GithubWorkflowDatabaseFields = Pick<
	github_workflows,
	'repository_id' | 'path' | 'contents'
>;

export interface RawGithubWorkflow extends GithubWorkflowDatabaseFields {
	repository_id: NonNullable<GithubWorkflowDatabaseFields['repository_id']>;
	path: NonNullable<GithubWorkflowDatabaseFields['path']>;
}

type GithubRepositoryDatabaseFields = Pick<
	github_repositories,
	'id' | 'full_name'
>;

export interface RawGithubRepository extends GithubRepositoryDatabaseFields {
	full_name: NonNullable<GithubRepositoryDatabaseFields['full_name']>;
}

export interface GithubWorkflowStep {
	name?: string;
	uses?: string;
}

export interface GithubWorkflow {
	/**
	 * Those jobs that consist of one step can be defined as a single object.
	 * Examples of single step workflows can be found in the `snyk.yaml` workflows.
	 * @see https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idsteps
	 * @see https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_iduses
	 */
	jobs: Record<
		string,
		| {
				steps: GithubWorkflowStep[];
		  }
		| GithubWorkflowStep
	>;
}

export interface ValidatedGithubWorkflow {
	repositoryId: bigint;
	repositoryFullName: string;
	workflowPath: string;
	workflowContents: GithubWorkflow;
}
