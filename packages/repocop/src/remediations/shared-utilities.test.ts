import type { AWSCloudformationTag, UpdateMessageEvent } from 'common/types';
import { createSqsEntry, getGuRepoName } from './shared-utilities';

describe('Batch entries should be created for each message', () => {
	test('The batch ID of the message should contain no special characters', () => {
		const event1: UpdateMessageEvent = {
			fullName: 'guardian/repo-1',
			teamNameSlugs: ['team-one'],
		};
		const event2: UpdateMessageEvent = {
			fullName: '!@£$%^&*()l',
			teamNameSlugs: ['team-two'],
		};

		const actual1 = createSqsEntry(event1);
		const actual2 = createSqsEntry(event2);

		expect(actual1.Id).toEqual('guardianrepo1');
		expect(actual2.Id).toEqual('l');
	});
});

describe('getGuRepoName', () => {
	it('should return undefined if the "gu:repo" tag value is not present', () => {
		const cfnTag: AWSCloudformationTag = {
			App: 'app-1',
			Stack: 'stack1',
			Stage: 'PROD',
			'gu:build-tool': 'guardian/some-build-tool',
		};
		const result: string | undefined = getGuRepoName(cfnTag);
		expect(result).toEqual(undefined);
	});

	it('should return only the "gu:repo" tag value', () => {
		const cfnTag: AWSCloudformationTag = {
			App: 'app-1',
			Stack: 'stack1',
			Stage: 'PROD',
			'gu:repo': 'guardian/repo-1',
			'gu:build-tool': 'guardian/some-build-tool',
		};
		const result: string | undefined = getGuRepoName(cfnTag);
		expect(result).toEqual('guardian/repo-1');
	});
});
