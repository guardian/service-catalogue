import type { NonEmptyArray, Repository } from './types';
import { isProduction, stringToSeverity, toNonEmptyArray } from './utils';

describe('isProduction', () => {
	test('should return correct values for prod and non-prod repos', () => {
		const prodRepo: Repository = {
			archived: false,
			full_name: 'test',
			id: 1n,
			name: 'test',
			topics: ['production'],
			default_branch: 'main',
			created_at: new Date(),
			pushed_at: new Date(),
			updated_at: new Date(),
		};
		const nonProdRepo: Repository = {
			...prodRepo,
			topics: [],
		};

		expect(isProduction(prodRepo)).toBe(true);
		expect(isProduction(nonProdRepo)).toBe(false);
	});
});

describe('Failure on empty arrays', () => {
	test('throw an error if input is an empty array', () => {
		const emptyArray: string[] = [];
		const nonEmptyArray: string[] = ['a', 'b'];
		const typedNonEmptyArray: NonEmptyArray<string> = ['a', 'b'];

		expect(() => toNonEmptyArray(emptyArray)).toThrow();
		expect(() => toNonEmptyArray(nonEmptyArray)).not.toThrow();
		expect(toNonEmptyArray(nonEmptyArray)).toEqual(nonEmptyArray);
		expect(toNonEmptyArray(nonEmptyArray)).toEqual(typedNonEmptyArray);
	});
});

describe('stringToSeverity', () => {
	test('should return unknown if it is passed an unexpected string', () => {
		expect(stringToSeverity('foo')).toBe('unknown');
	});
	test('should return the correct severity for valid inputs', () => {
		expect(stringToSeverity('low')).toBe('low');
		expect(stringToSeverity('medium')).toBe('medium');
		expect(stringToSeverity('high')).toBe('high');
		expect(stringToSeverity('critical')).toBe('critical');
	});
});
