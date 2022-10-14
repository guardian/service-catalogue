import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { exampleEvent } from './example-event';

export const main = async (
	event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
	console.log('[INFO] starting');
	console.log(event);

	const result: APIGatewayProxyResult = await Promise.resolve({
		statusCode: 200,
		body: 'ok',
	});

	return result;
};

if (require.main === module) {
	void (async () => await main(exampleEvent))();
}
