import { daysDifference } from './date';

describe('Date calculation', () => {
	test('Calculating the difference between two dates, both at midnight, in the same month', () => {
		const date1 = new Date(2023, 0, 20, 0, 0, 0);
		const date2 = new Date(2023, 0, 0, 0, 0, 0);

		expect(daysDifference(date1, date2)).toEqual(20);
	});

	test('Calculating the difference between two dates, both at midnight, across daylight saving time', () => {
		const date1 = new Date(2023, 6, 0, 0, 0, 0);
		const date2 = new Date(2022, 12, 0, 0, 0, 0);

		const expected = 31 + 31 + 28 + 31 + 30 + 31 - 1; // All of (Dec + Jan + Feb + Mar + Apr + May) - 1st Dec;
		expect(daysDifference(date1, date2)).toEqual(expected);
	});

	test('Calculating the difference between two dates, across daylight saving time', () => {
		const date1 = new Date(2023, 6, 0, 8, 0, 8);
		const date2 = new Date(2022, 12, 0, 12, 30, 45);

		const expected = 31 + 31 + 28 + 31 + 30 + 31 - 1; // All of (Dec + Jan + Feb + Mar + Apr + May) - 1st Dec;
		expect(daysDifference(date1, date2)).toEqual(expected);
	});
});
