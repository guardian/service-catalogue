import type { Severity } from 'common/src/types';

export interface Finding {
	awsAccountId: string;
	awsAccountName: string | null;
	title: string;
	resources: string[];
	remediationUrl: string | null;
	severity: Severity;
	priority: number | null;
	isWithinSla: boolean;
}

export interface Digest {
	accountId: string;
	subject: string;
	message: string;
}

export type GroupedFindings = Record<string, Finding[]>;
