import type { PrismaClient } from '@prisma/client';
import type { ObligationResult } from '.';

export type AwsResource = {
	account_id: string;
	arn: string;
	service: string;
	resource_type: string;
	taggable: string;
	tags?: Record<string, string> | null;
};

const REQUIRED_TAGS = ['Stack', 'Stage', 'App', 'gu:repo'] as const;

const isExemptResource = (resource: AwsResource): boolean => {
	if (resource.resource_type === 'role') {
		// AWS Creates roles for various services when onboarding them.
		// Technically we can tag these but they wouldn't belong to a specific App, Stage, or Stack.
		return resource.arn.includes('/aws-service-role/');
	}

	return false;
};

function resourceHasTag(resource: AwsResource, tag: string): boolean {
	return (
		typeof resource.tags === 'object' &&
		resource.tags?.[tag] !== undefined &&
		resource.tags[tag] !== ''
	);
}

export async function evaluateTaggingObligation(
	db: PrismaClient,
): Promise<ObligationResult[]> {
	const awsResources = await db.$queryRaw<AwsResource[]>`
		SELECT
			account_id,
			arn,
			service,
			resource_type,
			bool_or(taggable) as taggable,
			jsonb_aggregate(tags) as tags
		FROM aws_resources_raw()
		WHERE taggable = true
		GROUP BY account_id, arn, service, resource_type;
  `;

	const results: ObligationResult[] = [];

	for (const resource of awsResources) {
		if (isExemptResource(resource)) {
			continue;
		}

		for (const requiredTag of REQUIRED_TAGS) {
			if (resourceHasTag(resource, requiredTag)) {
				continue;
			}

			results.push({
				resource: resource.arn,
				reason: `Resource missing '${requiredTag}' tag.`,
				contacts: {
					aws_account: resource.account_id,
				},
			});
		}
	}

	return results;
}
