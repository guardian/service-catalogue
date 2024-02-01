import type { NonEmptyArray, Repository, Severity } from './types';

export function isProduction(repo: Repository) {
	return repo.topics.includes('production') && !repo.archived;
}

export function toNonEmptyArray<T>(value: T[]): NonEmptyArray<T> {
	if (value.length === 0) {
		throw new Error(`Expected a non-empty array. Source table may be empty.`);
	}
	return value as NonEmptyArray<T>;
}

export function stringToSeverity(severity: string): Severity {
	if (
		severity === 'low' ||
		severity === 'medium' ||
		severity === 'high' ||
		severity === 'critical'
	) {
		return severity;
	} else {
		return 'unknown';
	}
}
