import path from 'node:path';
import { awsTables } from 'cloudquery-tables/aws';
import { getTableNames } from 'cloudquery-tables/diff/parse';
import { endoflifeTables } from 'cloudquery-tables/endoflife';
import { fastlyTables } from 'cloudquery-tables/fastly';
import { githubTables } from 'cloudquery-tables/github';
import { CloudQueryPluginVersions } from 'cloudquery-tables/versions';

interface PluginToCheck {
	/**
	 * The name if the CloudQuery plugin.
	 */
	name: string;

	/**
	 * The version of the CloudQuery plugin, as defined in `.env` at the root of the repository.
	 */
	version: string;

	/**
	 * The tables currently being collected.
	 */
	currentTables: string[];

	/**
	 * The path to the JSON file created by the CloudQuery CLI (`cloudquery tables`).
	 */
	cliResponseFilepath: string;
}

interface Result
	extends Omit<PluginToCheck, 'currentTables' | 'cliResponseFilepath'> {
	/**
	 * Tables that will continue to be collected.
	 */
	validTables: string[];

	/**
	 * Tables that were being collected but no longer exist in the CloudQuery plugin.
	 */
	removedTables: string[];

	/**
	 * Tables that can be collected.
	 */
	availableTables: string[];
}

const pluginsToCheck: PluginToCheck[] = [
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

if (require.main === module) {
	const result: Result[] = pluginsToCheck.map((item) => {
		const { name, version, cliResponseFilepath, currentTables } = item;

		const tableNames = getTableNames(cliResponseFilepath);

		return {
			name,
			version,
			validTables: currentTables.filter((_) => tableNames.includes(_)),
			removedTables: currentTables.filter((_) => !tableNames.includes(_)),
			availableTables: tableNames.filter((_) => !currentTables.includes(_)),
		};
	});

	console.log(result);
}
