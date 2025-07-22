import  assert from 'assert';
import { describe, it } from 'node:test';
import { generateBranchName } from './pull-requests.js';

void describe('generateBranchName', () => {
	void it('does not produce the same branch name twice', () => {
		const prefix = 'hello';
		const branch1 = generateBranchName(prefix);
		const branch2 = generateBranchName(prefix);
		assert.notStrictEqual(branch1, branch2);
	});
});
