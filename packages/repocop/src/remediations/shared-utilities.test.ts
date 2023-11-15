import type { UpdateMessageEvent } from 'common/types';
import { createSqsEntry } from './shared-utilities';

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
