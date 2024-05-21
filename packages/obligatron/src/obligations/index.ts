export type ObligationResult = {
	/**
	 * Resource identifier. Varies depending on resource platform.
	 *   - Github -> Slug
	 *   - AWS -> ARN
	 */
	resource: string;

	/**
	 * Did this resource meet the obligation check?
	 */
	result: boolean;

	/**
	 * Explanation for the assessment failing.
	 */
	reasons: string[];

	/**
	 * Link to where the user can see more details on the resource.
	 */
	deep_link?: string;

	/**
	 * Associated AWS account ID (if any)
	 */
	aws_account_id?: string;

	/**
	 * Associated Github teams (if any)
	 */
	github_teams?: string[];
};
