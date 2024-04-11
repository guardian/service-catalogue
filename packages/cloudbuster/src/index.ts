import type { aws_securityhub_findings, PrismaClient } from '@prisma/client';
import { getPrismaClient } from 'common/database';
import { config } from 'dotenv';
import { getConfig } from './config';

config({ path: `../../.env` }); // Load `.env` file at the root of the repository

export async function main() {
	const config = await getConfig();
	const prisma: PrismaClient = getPrismaClient(config);
	const findings: aws_securityhub_findings[] =
		await prisma.aws_securityhub_findings.findMany();
	console.log(findings.slice(0, 5));
}
