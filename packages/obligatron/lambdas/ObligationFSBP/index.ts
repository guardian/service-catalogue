import type { ObligationLambdaInput } from 'packages/obligatron/lib/lambda';

export const handler = (input: ObligationLambdaInput[]) => {
	// load rows from service-catalogue / AWS / Github
	// do some calculation

	return {
		...input,
		// Has a team passed the obligation?
		passed: true,
		// Calculate a score (between 0 and 1) to give us a more fine grained view on whether teams are improving.
		// Should be 1 if they have passed. Calculation will change based on the obligation
		// For example, for the tagging obligation this could be (Untagged Resources / Total Resources)
		score: 1,
	};
};
