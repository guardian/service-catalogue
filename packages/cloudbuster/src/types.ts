import type { SecurityHubSeverity } from 'common/src/types';
import type { Action } from '@guardian/anghammarad';
export interface Finding {
	awsAccountId: string;
	awsAccountName: string | null;
	title: string;
	resources: string[];
	remediationUrl: string | null;
	severity: SecurityHubSeverity | null;
	priority: number | null;
	isWithinSla: boolean;
}

export interface Digest {
	accountId: string;
	accountName: string;
	actions: Action[];
	subject: string;
	message: string;
}

export type GroupedFindings = Record<string, Finding[]>;
