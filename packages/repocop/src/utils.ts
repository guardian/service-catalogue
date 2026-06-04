import type { RepocopVulnerability, Repository } from 'common/src/types.js';
import type { EvaluationResult } from './types.js';

export const MALWARE_SLA = 1; // all severities of malware have SLA of 1 working day

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

export function generalEvaluationResults(
	results: EvaluationResult[],
): EvaluationResult[] {
	return results
		.map((result) => {
			const generalVulns = result.vulnerabilities.filter(
				(vuln) => vuln.alert_type === 'general',
			);
			return { ...result, vulnerabilities: generalVulns };
		})
		.filter((result) => result.vulnerabilities.length > 0);
}

export function malwareEvaluationResults(
	results: EvaluationResult[],
): EvaluationResult[] {
	return results
		.map((result) => {
			const generalVulns = result.vulnerabilities.filter(
				(vuln) => vuln.alert_type === 'malware',
			);
			return { ...result, vulnerabilities: generalVulns };
		})
		.filter((result) => result.vulnerabilities.length > 0);
}
