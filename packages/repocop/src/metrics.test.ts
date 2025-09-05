import assert from 'assert';
import { describe, test } from 'node:test';
import { getPercentageTrue } from './metrics.js';

void describe('When evaluating the percentage of trues, an empty array', () => {
	void test('should return a value of zero', () => {
		assert.strictEqual(getPercentageTrue([]), 0);
	});
});
void describe('When evaluating the proportion of trues and falses, we', () => {
	void test('should return a value between zero and 100', () => {
		assert.strictEqual(getPercentageTrue([true]), 100);
		assert.strictEqual(getPercentageTrue([false]), 0);
		assert.strictEqual(getPercentageTrue([true, false]), 50);
	});
	void test('Should round to one decimal place', () => {
		assert.strictEqual(getPercentageTrue([true, true, false]), 66.7);
		assert.strictEqual(getPercentageTrue([true, false, false]), 33.3);
	});
});
void describe('An array that contains null values', () => {
	void test('should discount the nulls completely', () => {
		assert.strictEqual(getPercentageTrue([null]), 0);
		assert.strictEqual(getPercentageTrue([null, true]), 100);
		assert.strictEqual(getPercentageTrue([null, false, true]), 50);
	});
});
