import type {
	cloudquery_plugin_usage,
	PrismaClient,
} from 'common/prisma-client/client.js';

export function saveResults(
	client: PrismaClient,
	records: cloudquery_plugin_usage[],
) {
	console.log(`Saving ${records.length} cloudquery_plugin_usage`);
	return client.cloudquery_plugin_usage.createMany({ data: records });
}
