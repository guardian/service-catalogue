import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { exampleEvent } from './example-event';

export const main = async (
	event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
	console.log('[INFO] starting');
	console.log(event);

	return Promise.resolve({
		statusCode: 200,
		body: 'ok',
	});
};

if (require.main === module) {
	void (async () => main(exampleEvent))();
}
