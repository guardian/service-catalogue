import type { github_workflows } from '@prisma/client';

type DatabaseFields = Pick<
	github_workflows,
	'repository_id' | 'path' | 'contents'
>;

export interface RawGithubWorkflow extends DatabaseFields {
	repository_id: NonNullable<DatabaseFields['repository_id']>;
	path: NonNullable<DatabaseFields['path']>;
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
	path: string;
	repository_id: bigint;
	contents: GithubWorkflow;
}
