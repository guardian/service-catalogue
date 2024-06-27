import type { Prisma, PrismaClient } from '@prisma/client';
import { logger } from 'common/src/logs';
import type { ObligationResult } from '.';

type FindingResource = {
	/**
	 * The resource identifier, such as the ARN.
	 */
	Id: string;

	/**
	 * The tags on the resource.
	 *
	 * A value of `null` represents the absence of tags.
	 */
	Tags: null | Record<string, string>;
};

const securityHubLink = (region: string, findingId: string) => {
	// Annoyingly AWS doesn't seem to use any standard encoding that I'm aware of
	// meaning that we can't use encodeURI and must manually build the encoded URL.
	const BACK_SLASH = '%255C';
	const SLASH = '%252F';
	const SEMI_COLON = '%253A';

	const EQUALS = encodeURIComponent('='); // This one is actually standard encoding for =
	const AMPERSANS = encodeURIComponent('&'); // This one is actually standard encoding for &

	const queryParameter =
		`RecordState=\\operator\\:EQUALS\\:ACTIVE&Id=\\operator\\:EQUALS\\:${findingId}`
			.replaceAll(':', SEMI_COLON)
			.replaceAll('/', SLASH)
			.replaceAll('\\', BACK_SLASH)
			.replaceAll('=', EQUALS)
			.replaceAll('&', AMPERSANS);

	return `https://${region}.console.aws.amazon.com/securityhub/home?region=${region}#/findings?search=${queryParameter}`;
};

const isFindingResource = (resource: unknown): resource is FindingResource =>
	typeof resource === 'object' &&
	resource != null &&
	'Id' in resource &&
	'Tags' in resource;

export async function evaluateAmiTaggingCoverage(
	db: PrismaClient,
): Promise<ObligationResult[]> {
	const records = await db.aws_ec2_images.findMany({
		where: {
			account_id: {
				equals: db.aws_ec2_images.fields.owner_id,
			},
		},
	});

	const amiTags = [
		// The "core" tags
		'Stack',
		'Stage',
		'App',
		'gu:repo',

		// Tags added by AMIgo
		'AmigoStage',
		'SourceAMI',
		'BuildNumber',
		'BuiltBy',
		'Recipe',
		'BakeId',
	];

	return records.flatMap<ObligationResult>((record) => {
		const tagKeys = Object.keys(record.tags as Prisma.JsonObject);

		const missingTags = amiTags.filter((tag) => !tagKeys.includes(tag));
		logger.log({
			message: `AMI ${record.arn} is missing tags: ${missingTags.join(', ')}`,
		});

		return missingTags.map<ObligationResult>((tag) => {
			return {
				resource: record.arn,
				reason: `AMIs should be tagged. Missing tag: ${tag}`,
				contacts: {
					aws_account: record.account_id,
				},
			};
		});
	});
}

export async function evaluateSecurityHubTaggingCoverage(
	db: PrismaClient,
): Promise<ObligationResult[]> {
	const findings = await db.aws_securityhub_findings.findMany({
		where: {
			product_fields: {
				path: ['StandardsArn'],
				string_starts_with:
					'arn:aws:securityhub:::standards/aws-resource-tagging-standard',
			},
			compliance: {
				path: ['Status'],
				equals: 'FAILED',
			},
		},
	});

	logger.log({
		message: 'Received findings from security hub',
		total: findings.length,
	});

	const results: ObligationResult[] = [];

	for (const finding of findings) {
		const resources = finding.resources?.valueOf();

		if (!Array.isArray(resources)) {
			logger.error({
				message: `Skipping invalid SecurityHub finding, invalid 'resources' field`,
				finding_id: finding.id,
			});
			continue;
		}

		// The Security Hub spec indicates that a finding can have multiple resources,
		// I don't think this will happen for the Tagging rules, but lets be safe by
		// handling this situation and raising a warning.
		if (resources.length !== 1) {
			logger.warn({
				message: `Finding had more (or less) that 1 resource: ${resources.length}`,
				finding_id: finding.id,
			});
		}

		const validResources = resources.filter(isFindingResource);
		const invalidResources = resources.filter((f) => !isFindingResource(f));

		// This in theory should not happen as long as AWS don't change their schema.
		// if they do change the schema its unlikely to be just this one finding failing,
		// so lets make sure that we crash the lambda and get a humans attention!
		if (invalidResources.length > 0) {
			throw new Error(`Invalid resource in finding ${finding.id}`);
		}

		results.push(
			...validResources.map((resource) => ({
				resource: resource.Id,
				reason: finding.title,
				url: securityHubLink(finding.region, finding.id),
				contacts: {
					aws_account_id: finding.aws_account_id,

					...(resource.Tags !== null && {
						// Resource might only be missing one of these tags which might help us assert ownership
						Stack: resource.Tags.Stack,
						Stage: resource.Tags.Stage,
						App: resource.Tags.App,
					}),
				},
			})),
		);
	}

	return results;
}
