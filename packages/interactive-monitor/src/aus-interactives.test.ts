import assert from 'assert';
import { describe, it } from 'node:test';
import { isAusInteractive } from './aus-interactives.js';

void describe('isAusInteractive', () => {
    void it('should return false for a repo following the pattern oz-YYYY', () => {
        const validRepo = 'oz-2022';
        assert.strictEqual(isAusInteractive(validRepo), false);
    });
    void it('should return false for a repo following the pattern oz-YYMMDD', () => {
        const validRepo = 'oz-220101';
        assert.strictEqual(isAusInteractive(validRepo), false);
    });
    void it('should return true for a repo following the pattern oz-YYYY-name', () => {
        const validRepo = 'oz-2023-wildfires';
        assert.strictEqual(isAusInteractive(validRepo), true);
    });
    void it('should return true for a repo following the pattern oz-YYMMDD-name', () => {
        const validRepo = 'oz-220101-some-interactive';
        assert.strictEqual(isAusInteractive(validRepo), true);
    });
    void it('should return false for a repo not following the pattern', () => {
        const invalidRepo = 'oz-2022no-dash';
        assert.strictEqual(isAusInteractive(invalidRepo), false);
    })
    void it('should return false for a repo that ends in a dash', () => {
        const invalidRepo = 'oz-2022-';
        assert.strictEqual(isAusInteractive(invalidRepo), false);
    })
});
