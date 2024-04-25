export type ObligationLambdaInput = {
	teamId: string;
};

export type ObligationLambdaOutput = {
	teamId: string;
	passed: boolean;
	score: number;
	drillDownUrl?: string;
};
