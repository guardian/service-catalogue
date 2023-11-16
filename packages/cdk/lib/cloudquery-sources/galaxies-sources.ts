import {
	type GuStack,
	GuStringParameter,
} from '@guardian/cdk/lib/constructs/core';
import { GuS3Bucket } from '@guardian/cdk/lib/constructs/s3';
import type { Schedule } from 'aws-cdk-lib/aws-events';
import type { CloudquerySource } from '../ecs/cluster';
import { galaxiesSourceConfig } from '../ecs/config';
import { readBucketPolicy } from '../ecs/policies';

export class GalaxiesSources {
	public readonly sources: CloudquerySource[];
	constructor(guStack: GuStack, schedule: Schedule) {
		// The bucket in which the Galaxies data lives.
		const actionsStaticSiteBucketArn = new GuStringParameter(
			guStack,
			'ActionsStaticSiteBucketArnParam',
			{
				fromSSM: true,
				default: '/INFRA/deploy/cloudquery/actions-static-site-bucket-arn',
			},
		).valueAsString;

		const actionsStaticSiteBucket = GuS3Bucket.fromBucketArn(
			guStack,
			'ActionsStaticSiteBucket',
			actionsStaticSiteBucketArn,
		);

		const galaxiesSources: CloudquerySource[] = [
			{
				name: 'Galaxies',
				description: 'Galaxies data',
				schedule,
				policies: [
					readBucketPolicy(
						`${actionsStaticSiteBucket.bucketArn}/galaxies.gutools.co.uk/data/*`,
					),
				],
				config: galaxiesSourceConfig(actionsStaticSiteBucket.bucketName),
			},
		];
		this.sources = galaxiesSources;
	}
}
