import type { aws_securityhub_findings, PrismaClient } from '@prisma/client';
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

export type SecurityHubFinding = Pick<
	aws_securityhub_findings,
	'first_observed_at' | 'aws_account_id'
> & {
	severity: { Label: string; Normalized: number };
	resources: Resource[];
	product_fields: ProductFields;
};

type Failure = {
	resource: string;
	controlId: string;
	accountId: string;
	tags: Record<string, string>;
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
		// @ts-expect-error - TS doesn't understand that we've just checked for the key
		grouped[failure.resource].push(failure);
	}

	return grouped;
}

function failuresToObligationResult(
	arn: string,
	failures: Failure[],
): ObligationResult {
	const oneFailure = failures[0]; //this should always exist because groupFailuresByResource should always return at least one failure

	const controlIds: string[] = failures.map((f) => f.controlId);
	const accountId: string | undefined = oneFailure?.accountId;
	const tags = oneFailure?.tags;
	return {
		resource: arn,
		reason: `The following AWS FSBP controls are failing: ${controlIds.join(', ')}`,
		url: 'https://docs.aws.amazon.com/securityhub/latest/userguide/fsbp-standard.html',
		contacts: {
			aws_account_id: accountId,
			Stack: tags?.Stack,
			Stage: tags?.Stage,
			App: tags?.App,
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

//TODO filter out findings that are within the SLA window
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
