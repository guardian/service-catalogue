import { describe, expect, test } from 'vitest';
import { getPercentageTrue } from './metrics';

describe('When evaluating the percentage of trues, an empty array', () => {
	test('should return a value of zero', () => {
		expect(getPercentageTrue([])).toBe(0);
	});
});
describe('When evaluating the proportion of trues and falses, we', () => {
	test('should return a value between zero and 100', () => {
		expect(getPercentageTrue([true])).toBe(100);
		expect(getPercentageTrue([false])).toBe(0);
		expect(getPercentageTrue([true, false])).toBe(50);
	});
	test('Should round to one decimal place', () => {
		expect(getPercentageTrue([true, true, false])).toBe(66.7);
		expect(getPercentageTrue([true, false, false])).toBe(33.3);
	});
});
describe('An array that contains null values', () => {
	test('should discount the nulls completely', () => {
		expect(getPercentageTrue([null])).toBe(0);
		expect(getPercentageTrue([null, true])).toBe(100);
		expect(getPercentageTrue([null, false, true])).toBe(50);
	});
});
