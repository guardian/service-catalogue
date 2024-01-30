import type { NonEmptyArray, Repository } from './types';
import { isProduction, SetWithContentEquality, toNonEmptyArray } from './utils';

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

describe('SetWithContentEquality', () => {
	test('should add unique items to the set', () => {
		const set = new SetWithContentEquality<string>((s) => s);
		set.add('a');
		set.add('b');
		expect(set.values().length).toBe(2);
	});
	test('should not add duplicate items to the set', () => {
		const set = new SetWithContentEquality<string>((s) => s);
		set.add('a');
		set.add('a');
		expect(set.values().length).toBe(1);
	});
});
