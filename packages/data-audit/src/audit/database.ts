import type { audit_results, PrismaClient } from '@prisma/client';

export type Audit = Omit<audit_results, 'evaluated_on' | 'success'>;

function auditResult(audit: Audit) {
	const { name, cloudquery, vendor } = audit;
	const status = cloudquery === vendor ? 'PASS' : 'FAIL';
	return `${status} ${name} check. CloudQuery: ${cloudquery} Vendor: ${vendor}`;
}

export async function saveAudits(client: PrismaClient, audits: Audit[]) {
	const now = new Date();

	const records: audit_results[] = audits.map((audit) => {
		const { cloudquery, vendor } = audit;
		const success = cloudquery === vendor;

		console.log(auditResult(audit));

		return {
			evaluated_on: now,
			success,
			...audit,
		};
	});

	console.log('Clearing the audit_results table');
	await client.audit_results.deleteMany();

	console.log(`Saving ${records.length} audit_results`);
	await client.audit_results.createMany({ data: records });
}
