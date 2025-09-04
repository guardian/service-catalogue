import type { PrismaClient } from '@prisma/client';
import { getFsbpFindings } from 'common/src/database-queries.js';
import {
	isWithinSlaTime,
	stringToSeverity,
	toNonEmptyArray,
} from 'common/src/functions.js';
import type { SecurityHubFinding } from 'common/src/types.js';
import type { ObligationResult } from './index.js';

type Failure = {
	resource: string;
	controlId: string;
	accountId: string | null;
	tags: Record<string, string> | null;
};

function findingToFailures(finding: SecurityHubFinding): Failure[] {
	return finding.resources.map((resource) => ({
		resource: resource.Id,
		controlId: finding.product_fields.ControlId,
		accountId: finding.aws_account_id,
		tags: resource.Tags,
	}));
}

function groupFailuresByResource(
	failures: Failure[],
): Record<string, Failure[]> {
	const grouped: Record<string, Failure[]> = {};

	for (const failure of failures) {
		if (!grouped[failure.resource]) {
			grouped[failure.resource] = [];
		}

		grouped[failure.resource]?.push(failure);
	}

	return grouped;
}

function failuresToObligationResult(
	arn: string,
	failures: Failure[],
): ObligationResult {
	const oneFailure = toNonEmptyArray(failures)[0];

	const controlIds: string[] = failures.map((f) => f.controlId);
	const accountId: string | null = oneFailure.accountId;
	const tags = oneFailure.tags;
	return {
		resource: arn,
		reason: `The following AWS FSBP controls are failing: ${controlIds.join(', ')}`,
		url: 'https://docs.aws.amazon.com/securityhub/latest/userguide/fsbp-standard.html',
		contacts: {
			aws_account_id: accountId ?? undefined,
			Stack: tags === null ? undefined : tags.Stack,
			Stage: tags === null ? undefined : tags.Stage,
			App: tags === null ? undefined : tags.App,
		},
	};
}

function failuresToObligationResults(
	failuresByResource: Record<string, Failure[]>,
): ObligationResult[] {
	return Object.entries(failuresByResource).map(([resource, failures]) =>
		failuresToObligationResult(resource, failures),
	);
}

export function fsbpFindingsToObligatronResults(
	findings: SecurityHubFinding[],
): ObligationResult[] {
	const allFailures = findings.flatMap(findingToFailures);
	const failuresByResource = groupFailuresByResource(allFailures);
	return failuresToObligationResults(failuresByResource);
}

export async function evaluateFsbpVulnerabilities(
	client: PrismaClient,
): Promise<ObligationResult[]> {
	const findings = (await getFsbpFindings(client, ['CRITICAL', 'HIGH']))
		.map((v) => v as unknown as SecurityHubFinding)
		.filter((f) => f.workflow.Status !== 'SUPPRESSED');

	console.log(`Found ${findings.length} active FSBP findings`);

	const outOfSlaFindings = findings.filter(
		(f) =>
			!isWithinSlaTime(f.first_observed_at, stringToSeverity(f.severity.Label)),
	);

	console.log(`Found ${outOfSlaFindings.length} active findings out of SLA`);

	const results = fsbpFindingsToObligatronResults(outOfSlaFindings);

	return results;
}
