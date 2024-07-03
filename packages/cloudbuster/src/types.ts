export type SecurityHubSeverity =
	| 'CRITICAL'
	| 'HIGH'
	| 'INFORMATION'
	| 'LOW'
	| 'MEDIUM';

export type Finding = {
	accountName: string;
	title: string;
	severity: SecurityHubSeverity;
	withinSlaTime: boolean;
};
