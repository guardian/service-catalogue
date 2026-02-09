import type {
	audit_results,
	PrismaClient,
} from 'common/prisma-client/client.js';

export type Audit = Omit<audit_results, 'evaluated_on' | 'success'>;

function auditResult(audit: Audit) {
	const { name, cloudquery_total, vendor_total } = audit;
	const status = cloudquery_total === vendor_total ? 'PASS' : 'FAIL';
	return `${status} ${name} check. CloudQuery: ${cloudquery_total} Vendor: ${vendor_total}`;
}

export async function saveAudits(client: PrismaClient, audits: Audit[]) {
	const now = new Date();

	const records: audit_results[] = audits.map((audit) => {
		const { cloudquery_total, vendor_total } = audit;
		const success = cloudquery_total === vendor_total;

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
