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
	contacts?: Record<string, string>;
};
