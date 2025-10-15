import path from 'node:path';
import { awsTables } from 'cloudquery-tables/aws';
import type { PluginToCheck } from 'cloudquery-tables/diff/types';
import { endoflifeTables } from 'cloudquery-tables/endoflife';
import { fastlyTables } from 'cloudquery-tables/fastly';
import { githubTables } from 'cloudquery-tables/github';
import { CloudQueryPluginVersions } from 'cloudquery-tables/versions';

export const pluginsToCheck: PluginToCheck[] = [
	{
		name: 'aws',
		version: CloudQueryPluginVersions.CloudqueryAws,
		currentTables: awsTables,
	},
	{
		name: 'github',
		version: CloudQueryPluginVersions.CloudqueryGithub,
		currentTables: githubTables,
	},
	{
		name: 'fastly',
		version: CloudQueryPluginVersions.CloudqueryFastly,
		currentTables: fastlyTables,
	},
	{
		name: 'endoflife',
		version: CloudQueryPluginVersions.CloudqueryEndOfLife,
		currentTables: endoflifeTables,
	},
].map((item) => ({
	...item,
	cliResponseFilepath: path.join(
		__dirname,
		`../../cq-docs/${item.name}/__tables.json`,
	),
}));
