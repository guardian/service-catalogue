import assert from 'assert';
import { describe, it } from 'node:test';
import { chooseScope } from './types.js';

void describe('chooseScope', () => {
    void it('should return the correct scope for a valid input', () => {
        assert.strictEqual(chooseScope('runtime'), 'runtime');
        assert.strictEqual(chooseScope('development'), 'development');
    });

    void it('should return "runtime" for an invalid input', () => {
        assert.strictEqual(chooseScope('unknown'), 'runtime');
    });

    void it('should return "runtime" for undefined input', () => {
        assert.strictEqual(chooseScope(undefined), 'runtime');
        assert.strictEqual(chooseScope(null), 'runtime');
    });
});
