import { describe, expect, it } from 'vitest';
import { getCentralElkLink } from './logs';

describe('getCentralElkUrl', () => {
	it('should form a valid link', () => {
		const actual = getCentralElkLink({
			filters: {
				stack: 'deploy',
				stage: 'CODE',
				app: 'service-catalogue',
			},
		});
		const expected =
			"https://logs.gutools.co.uk/s/devx/app/discover#/?_g=(filters:!((query:(match_phrase:(stack:'deploy'))),(query:(match_phrase:(stage:'CODE'))),(query:(match_phrase:(app:'service-catalogue')))))";
		expect(actual).toEqual(expected);
	});

	it('should form a valid link with columns', () => {
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
		expect(actual).toEqual(expected);
	});
});
