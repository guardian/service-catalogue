import type { Digest, Finding, GroupedFindings } from './types';

function createEmailBody(findings: Finding[]): string {
	const findingsSortedByPriority = findings.sort(
		(a, b) => (b.priority ?? 0) - (a.priority ?? 0),
	);

	return `The following vulnerabilities have been found in your account\n: 
        ${findingsSortedByPriority
					.map(
						(f) =>
							`[${f.severity}] ${f.title}
Affected resource(s): ${f.resources.join(',')}
Remediation: ${f.remediationUrl ?? 'Unknown'}`,
					)
					.join('\n\n')}`;
}

export function createDigestForAccount(
	awsAccountId: string,
	findings: GroupedFindings,
): Digest | undefined {
	const teamFindings = findings[awsAccountId];

	if (!teamFindings || teamFindings.length == 0) {
		return undefined;
	}

	return {
		accountId: awsAccountId,
		subject: `Security Hub vulnerabilities detected in AWS account ${teamFindings[0]?.awsAccountName}`,
		message: createEmailBody(teamFindings),
	};
}
