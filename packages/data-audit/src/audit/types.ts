export interface Audit {
	name: string;
	db: number;
	aws: number;
}

export function auditResult(audit: Audit) {
	const status = audit.db === audit.aws ? 'PASS' : 'FAIL';
	return `${status} ${audit.name} check. DB: ${audit.db} AWS: ${audit.aws}`;
}
