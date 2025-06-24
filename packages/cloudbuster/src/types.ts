import type { Action } from '@guardian/anghammarad';
import type { cloudbuster_fsbp_vulnerabilities } from '@prisma/client';

export interface Digest {
	accountId: string;
	accountName: string;
	actions: Action[];
	subject: string;
	message: string;
}

export type GroupedFindings = Record<
	string,
	cloudbuster_fsbp_vulnerabilities[]
>;

export type StackUpdateTimes = Map<string, Date>;
