import { isFirstOrThirdTuesdayOfMonth } from './vuln-digest';

describe('isFirstOrThirdTuesdayOfMonth', () => {
	test('should return true if the date is the first or third Tuesday of the month', () => {
		const tuesday = new Date('2024-02-06T00:00:00.000Z'); // First Tuesday
		const result = isFirstOrThirdTuesdayOfMonth(tuesday);
		expect(result).toBe(true);
	});
	test('should return false if the date is not a Tuesday', () => {
		const wednesday = new Date('2024-02-07T00:00:00.000Z'); // First Wednesday
		const result = isFirstOrThirdTuesdayOfMonth(wednesday);
		expect(result).toBe(false);
	});
	test('should return false if the date is the second Tuesday of the month', () => {
		const tuesday = new Date('2024-02-13T00:00:00.000Z'); // Second Tuesday
		const result = isFirstOrThirdTuesdayOfMonth(tuesday);
		expect(result).toBe(false);
	});
});
