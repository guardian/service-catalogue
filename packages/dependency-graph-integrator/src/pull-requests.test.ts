import { describe, expect, it } from 'vitest';
import { generateBranchName } from './pull-requests';

describe('generateBranchName', () => {
	it('does not produce the same branch name twice', () => {
		const prefix = 'hello';
		const branch1 = generateBranchName(prefix);
		const branch2 = generateBranchName(prefix);
		expect(branch1).not.toEqual(branch2);
	});
});
