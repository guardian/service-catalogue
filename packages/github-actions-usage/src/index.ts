import { getPrismaClient } from 'common/database';
import { getConfig } from './config';

export async function main() {
	const config = await getConfig();
	const prismaClient = getPrismaClient(config);

	const workflows = await prismaClient.github_workflows.findMany({
		select: {
			contents: true,
		},
		take: 10,
	});

	workflows.forEach(({ contents }) => {
		console.log(contents);
	});
}
