import type { aws_securityhub_findings, PrismaClient } from '@prisma/client';
import { logger } from 'common/logs';
import { getFsbpFindings } from 'common/src/database-queries';
import type { ObligationResult } from '.';

type Resource = {
	Id: string;
	Tags: Record<string, string>;
	Region: string;
	Type: string;
};

type ProductFields = {
	ControlId: string;
	StandardsArn: string;
};

type SecurityHubFinding = Pick<
	aws_securityhub_findings,
	'first_observed_at'
> & {
	severity: { Label: string; Normalized: number };
	resources: Resource[];
	product_fields: ProductFields;
};

type Failure = {
	resource: string;
	controlId: string;
};

function findingToFailures(finding: SecurityHubFinding): Failure[] {
	return finding.resources.map((resource) => ({
		resource: resource.Id,
		controlId: finding.product_fields.ControlId,
	}));
}

function groupFailuresByResource(
	failures: Failure[],
): Record<string, string[]> {
	const grouped: Record<string, string[]> = {};

	for (const failure of failures) {
		if (!grouped[failure.resource]) {
			grouped[failure.resource] = [];
		}
		// @ts-expect-error - TS doesn't understand that we've just checked for the key
		grouped[failure.resource].push(failure.controlId);
	}

	return grouped;
}

function failuresToObligationResults(
	failuresByResource: Record<string, string[]>,
): ObligationResult[] {
	return Object.entries(failuresByResource).map(([resource, controlIds]) => ({
		resource,
		reason: `The following AWS FSBP controls are failing: ${controlIds.join(', ')}`,
		url: 'https://docs.aws.amazon.com/securityhub/latest/userguide/fsbp-standard.html',
		//TODO get AWS account ID
	}));
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
	const findings = (await getFsbpFindings(client, ['CRITICAL', 'HIGH'])).map(
		(v) => v as unknown as SecurityHubFinding,
	);

	const results = fsbpFindingsToObligatronResults(findings).slice(0, 5);
	console.log(results);

	return []; //failuresToObligationResults(failuresByResource).slice(0, 5);
}
