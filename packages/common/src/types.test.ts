import assert from 'assert';
import { describe, it } from 'node:test';
import { chooseDependencyScope } from './types.js';

void describe('chooseScope', () => {
	void it('should return the correct scope for a valid input', () => {
		assert.strictEqual(
			chooseDependencyScope('runtime', 'package', 'repo'),
			'runtime',
		);
		assert.strictEqual(
			chooseDependencyScope('development', 'package', 'repo'),
			'development',
		);
	});

	void it('should return "runtime" for an invalid input', () => {
		assert.strictEqual(
			chooseDependencyScope('unknown', 'package', 'repo'),
			'runtime',
		);
	});

	void it('should return "runtime" for undefined input', () => {
		assert.strictEqual(
			chooseDependencyScope(undefined, 'package', 'repo'),
			'runtime',
		);
		assert.strictEqual(
			chooseDependencyScope(null, 'package', 'repo'),
			'runtime',
		);
	});
});
