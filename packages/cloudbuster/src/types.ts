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
	subject: string;
	message: string;
}

export type SecurityHubSeverity =
	| 'CRITICAL'
	| 'HIGH'
	| 'INFORMATION'
	| 'LOW'
	| 'MEDIUM';

export type GroupedFindings = Record<string, Finding[]>;
