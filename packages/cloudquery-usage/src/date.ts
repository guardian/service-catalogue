import type { DateRange } from './types.js';

function checkBothPresentOrAbsent<T>(
	a: T | undefined | null,
	b: T | undefined | null,
): boolean {
	return (a === undefined || a === null) === (b === undefined || b === null);
}

function bothPresent<T>(
	a: T | undefined | null,
	b: T | undefined | null,
): boolean {
	return a !== undefined && a !== null && b !== undefined && b !== null;
}

function atMidnight(date: Date): Date {
	date.setHours(0, 0, 0, 0);
	return date;
}

function yesterdayAtMidnight(): Date {
	const date = new Date();
	date.setDate(date.getDate() - 1);
	return atMidnight(date);
}

export function getDateRange(): DateRange {
	const startEnv = process.env['START_DATE'];
	const endEnv = process.env['END_DATE'];

	if (!checkBothPresentOrAbsent(startEnv, endEnv)) {
		throw new Error(
			`When using environment variables, both START_DATE (${startEnv}) and END_DATE (${endEnv}) must be provided.`,
		);
	}

	if (!bothPresent(startEnv, endEnv)) {
		return { start: yesterdayAtMidnight(), end: atMidnight(new Date()) };
	}

	// This `if` is only needed to satisfy the type checker, as is the final `throw` statement.
	if (startEnv && endEnv) {
		const startDate = new Date(startEnv);
		if (startDate.toString() === 'Invalid Date') {
			throw new Error(`Invalid START_DATE: ${startEnv}`);
		}

		const endDate = new Date(endEnv);
		if (endDate.toString() === 'Invalid Date') {
			throw new Error(`Invalid END_DATE: ${endEnv}`);
		}

		if (startDate > endDate) {
			throw new Error('START_DATE must be before END_DATE');
		}

		return {
			start: atMidnight(startDate),
			end: atMidnight(endDate),
		};
	}

	throw new Error('Unreachable code');
}
