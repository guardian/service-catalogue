import type { Action } from '@guardian/anghammarad';
import type { cloudbuster_fsbp_vulnerabilities } from 'common/generated/prisma/client.js';

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
