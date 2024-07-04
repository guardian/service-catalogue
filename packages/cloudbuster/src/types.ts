export interface FsbpDigest {
	awsAccountName: string | null;
	title: string;
	remediationUrl: string | null;
	severity: SecurityHubSeverity | null;
	firstObservedAt: Date | null;
	isWithinSla: boolean;
}

export type SecurityHubSeverity =
	| 'CRITICAL'
	| 'HIGH'
	| 'INFORMATION'
	| 'LOW'
	| 'MEDIUM';
