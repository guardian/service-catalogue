import type { RepocopVulnerability, Repository } from 'common/src/types.js';

export function isProduction(repo: Repository) {
	return repo.topics.includes('production') && !repo.archived;
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
