import assert from 'assert';
import { describe, it } from 'node:test';
import { getCentralElkLink, getEcsTaskLogsLink } from './logs.js';

void describe('getCentralElkUrl', () => {
	void it('should form a valid link', () => {
		const actual = getCentralElkLink({
			filters: {
				stack: 'deploy',
				stage: 'CODE',
				app: 'service-catalogue',
			},
		});
		const expected =
			"https://logs.gutools.co.uk/s/devx/app/discover#/?_g=(filters:!((query:(match_phrase:(stack:'deploy'))),(query:(match_phrase:(stage:'CODE'))),(query:(match_phrase:(app:'service-catalogue')))))";
		assert.strictEqual(actual, expected);
	});

	void it('should form a valid link with columns', () => {
		const actual = getCentralElkLink({
			filters: {
				stack: 'deploy',
				stage: 'CODE',
				app: 'service-catalogue',
			},
			columns: ['message'],
		});
		const expected =
			"https://logs.gutools.co.uk/s/devx/app/discover#/?_g=(filters:!((query:(match_phrase:(stack:'deploy'))),(query:(match_phrase:(stage:'CODE'))),(query:(match_phrase:(app:'service-catalogue')))))&_a=(columns:!(message))";
		assert.strictEqual(actual, expected);
	});
});

void describe('getEcsTaskLogsLink', () => {
	void it('should form a valid link without app', () => {
		const actual = getEcsTaskLogsLink({
			stage: 'CODE',
			ecsTaskArn: 'arn:aws:ecs:eu-west-1:123456789012:task/cluster-name/abc123',
		});
		const expected =
			"https://logs.gutools.co.uk/s/devx/app/discover#/?_g=(filters:!((query:(match_phrase:(stage:'CODE'))),(query:(match_phrase:(ecs_task_arn:'arn:aws:ecs:eu-west-1:123456789012:task/cluster-name/abc123')))))";
		assert.strictEqual(actual, expected);
	});

	void it('should form a valid link with columns', () => {
		const actual = getEcsTaskLogsLink({
			stage: 'CODE',
			ecsTaskArn: 'arn:aws:ecs:eu-west-1:123456789012:task/cluster-name/abc123',
			columns: ['message'],
		});
		const expected =
			"https://logs.gutools.co.uk/s/devx/app/discover#/?_g=(filters:!((query:(match_phrase:(stage:'CODE'))),(query:(match_phrase:(ecs_task_arn:'arn:aws:ecs:eu-west-1:123456789012:task/cluster-name/abc123')))))&_a=(columns:!(message))";
		assert.strictEqual(actual, expected);
	});
});
