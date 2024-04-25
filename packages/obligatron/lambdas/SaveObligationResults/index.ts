import type { ObligationLambdaOutput } from '../../lib/lambda';

export const handler = (input: ObligationLambdaOutput[]) => {
	// TODO: Save results to DB instead of logging.
	console.log(JSON.stringify(input));
};
