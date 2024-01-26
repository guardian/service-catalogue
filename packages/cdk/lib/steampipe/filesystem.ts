import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { Fn } from 'aws-cdk-lib';
import type { FileSystemProps } from 'aws-cdk-lib/aws-efs';
import { CfnMountTarget, FileSystem } from 'aws-cdk-lib/aws-efs';

/**
 * This GuFileSystem type is a wrapper around a regular aws-efs FileSystem.
 *
 * Ordinarilly FileSystem requires Subnets to be known at synth time so that it can configure a resource in each subnet. However,
 * due to how we configure VPCs subnets aren't known at synth time making it difficult for the regular FileSystem construct to function.
 *
 * This type expects a VPC to only have 3 availability zones, this should be fine for most applications as we mostly use eu-west-1
 */
export class GuFileSystem extends FileSystem {
	constructor(scope: GuStack, id: string, props: FileSystemProps) {
		super(scope, id, {
			...props,
			// Skip generating MountTarget for availability zones. We handle this ourselves below.
			vpcSubnets: {
				subnets: [],
			},
		});

		// The underlying FileSystem does not seem to like using a reference to subnets
		// and throws the error "Found an encoded list token string in a scalar string context"
		// Manually create MountTagets for each AZ (this assumed that the FileSystem is being used in eu-west-1 with 3 AZs)
		// MountTargets don't have an associated cost and allow us to access our EFS volume in any AZ without incurring cross AZ transfer costs
		const subnets = props.vpc.selectSubnets(props.vpcSubnets);
		new CfnMountTarget(scope, `EfsMountTarget-${id}-A`, {
			fileSystemId: this.fileSystemId,
			securityGroups: props.securityGroup
				? [props.securityGroup.securityGroupId]
				: [],
			subnetId: Fn.select(0, subnets.subnetIds),
		});
		new CfnMountTarget(scope, `EfsMountTarget-${id}-B`, {
			fileSystemId: this.fileSystemId,
			securityGroups: props.securityGroup
				? [props.securityGroup.securityGroupId]
				: [],
			subnetId: Fn.select(1, subnets.subnetIds),
		});
		new CfnMountTarget(scope, `EfsMountTarget-${id}-C`, {
			fileSystemId: this.fileSystemId,
			securityGroups: props.securityGroup
				? [props.securityGroup.securityGroupId]
				: [],
			subnetId: Fn.select(2, subnets.subnetIds),
		});
	}
}
