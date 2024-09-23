import { Anghammarad } from '@guardian/anghammarad';
import { isWithinSlaTime, stringToSeverity } from 'common/functions';
import { getFsbpFindings } from 'common/src/database-queries';
import { getPrismaClient } from 'common/src/database-setup';
import type { SecurityHubFinding, SecurityHubSeverity } from 'common/src/types';
import { getConfig } from './config';
import { createDigestsFromFindings, sendDigest } from './digests';
import { transformFinding } from './findings';

type LambdaHandlerProps = {
	severities?: SecurityHubSeverity[];
};

interface GuFsbpFinding {
	severity: SecurityHubSeverity;
	controlId: string;
	title: string;
	repo: string | undefined;
	stack: string | undefined;
	stage: string | undefined;
	app: string | undefined;
	first_observed_at: Date | undefined;
	arn: string;
	aws_account_name: string | undefined;
	aws_account_id: string;
	within_sla: boolean;
}

function shFindingToGuFindings(finding: SecurityHubFinding): GuFsbpFinding[] {
	const transformedFindings = finding.resources.map((r) => {
		const guFinding: GuFsbpFinding = {
			severity: finding.severity.Label,
			controlId: finding.product_fields.ControlId,
			title: finding.title,
			repo: r.Tags?.['gu:repo'] ?? undefined,
			stack: r.Tags?.Stack ?? undefined,
			stage: r.Tags?.Stage ?? undefined,
			app: r.Tags?.App ?? undefined,
			first_observed_at: finding.first_observed_at ?? undefined,
			arn: r.Id,
			aws_account_name: finding.aws_account_name ?? undefined,
			aws_account_id: finding.aws_account_id,
			within_sla: isWithinSlaTime(
				finding.first_observed_at,
				stringToSeverity(finding.severity.Label),
			),
		};
		return guFinding;
	});
	return transformedFindings;
}

export async function main(input: LambdaHandlerProps) {
	// When manually invoking the function in AWS for testing,
	// it can be cumbersome to manually type this object as an input.
	// Therefore, fall back to default values.
	const { severities = ['CRITICAL', 'HIGH'] } = input;

	// *** SETUP ***
	const config = await getConfig();
	const prisma = getPrismaClient(config);

	// *** DATA GATHERING ***
	console.log(
		`Starting Cloudbuster. Level of severities that will be scanned: ${severities.join(', ')}`,
	);

	const dbResults = (await getFsbpFindings(prisma, severities)).slice(0, 5); //TODO: remove slice when ready to go live

	const findings = dbResults.map((f) => transformFinding(f));

	const digests = createDigestsFromFindings(findings);

	const tableContents = dbResults.flatMap(shFindingToGuFindings);

	console.table(tableContents);

	// *** NOTIFICATION SENDING ***
	const anghammaradClient = new Anghammarad();

	await Promise.all(
		digests.map(
			async (digest) => await sendDigest(anghammaradClient, config, digest),
		),
	);
}
