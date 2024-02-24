import type { guardian_github_actions_usage } from '@prisma/client';

export interface ReadDatabaseRow {
	full_name: string;
	path: string;
	contents: string;
}

export type DraftGithubActionUsageRow = Omit<
	guardian_github_actions_usage,
	'evaluated_on'
>;

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
	repositoryFullName: string;
	workflowPath: string;
	workflowContents: GithubWorkflow;
}
