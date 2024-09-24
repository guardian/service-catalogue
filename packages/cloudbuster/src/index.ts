import { Anghammarad } from '@guardian/anghammarad';
import type { cloudbuster_fsbp_vulnerabilities } from '@prisma/client';
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

function findingsToGuardianFormat(
	finding: SecurityHubFinding,
): cloudbuster_fsbp_vulnerabilities[] {
	const transformedFindings: cloudbuster_fsbp_vulnerabilities[] =
		finding.resources.map((r) => {
			const guFinding: cloudbuster_fsbp_vulnerabilities = {
				severity: finding.severity.Label,
				control_id: finding.product_fields.ControlId,
				title: finding.title,
				aws_region: r.Region,
				repo: r.Tags?.['gu:repo'] ?? null,
				stack: r.Tags?.['Stack'] ?? null,
				stage: r.Tags?.Stage ?? null,
				app: r.Tags?.App ?? null,
				first_observed_at: finding.first_observed_at,
				arn: r.Id,
				aws_account_name: finding.aws_account_name,
				aws_account_id: finding.aws_account_id,
				within_sla: isWithinSlaTime(
					finding.first_observed_at,
					stringToSeverity(finding.severity.Label),
				),
				remediation: finding.remediation.Recommendation.Url,
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

	const tableContents = dbResults.flatMap(findingsToGuardianFormat);

	console.table(tableContents);

	await prisma.cloudbuster_fsbp_vulnerabilities.deleteMany();
	await prisma.cloudbuster_fsbp_vulnerabilities.createMany({
		data: tableContents,
	});

	const digests = createDigestsFromFindings(findings);

	// *** NOTIFICATION SENDING ***
	const anghammaradClient = new Anghammarad();

	await Promise.all(
		digests.map(
			async (digest) => await sendDigest(anghammaradClient, config, digest),
		),
	);
}
