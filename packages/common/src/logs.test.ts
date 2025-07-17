import  assert from 'assert';
import { describe, it } from 'node:test';
import { getCentralElkLink } from './logs';


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
