// Slightly hacky file to allow CDK project to import the list of obligations without having to compile the whole Obligatron project

export const Obligations = [
	// 'TAGGING',
	'PRODUCTION_DEPENDENCIES',
	'AWS_VULNERABILITIES',
] as const;
export type Obligation = (typeof Obligations)[number];

export const stringIsObligation = (input: string): input is Obligation => {
	return Obligations.filter((v) => v === input).length > 0;
};

export type AwsContact = {
	aws_account_id?: string;
	Stack?: string;
	Stage?: string;
	App?: string;
};

type GitHubContact = { slugs: string[] };

export type ObligationResult = {
	/**
	 * Resource identifier. Varies depending on resource platform.
	 *   - Github -> Slug
	 *   - AWS -> ARN
	 */
	resource: string;

	/**
	 * Explanation for the assessment failing.
	 */
	reason: string;

	/**
	 * Link to where the user can see more details on the resource.
	 */
	url?: string;

	/**
	 * Key-value pairs to link failing obligations to the responsible teams.
	 */

	contacts?: AwsContact | GitHubContact;
};
