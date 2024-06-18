import type { RepocopVulnerability, Severity } from 'common/src/types';
import type { NonEmptyArray, Repository } from './types';

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

const criticalFirstPredicate = (x: RepocopVulnerability) =>
	x.severity === 'critical' ? -1 : 1;

const patchableFirstPredicate = (x: RepocopVulnerability) =>
	x.is_patchable ? -1 : 1;

export const vulnSortPredicate = (
	v1: RepocopVulnerability,
	v2: RepocopVulnerability,
) => {
	if (v1.severity === v2.severity) {
		return patchableFirstPredicate(v1);
	} else {
		return criticalFirstPredicate(v1);
	}
};
