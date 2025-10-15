import * as fs from 'node:fs';
import path from 'node:path';
import { h1, h2, h3, italic, tsMarkdown } from 'ts-markdown';
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

function createReport(result: Result[]) {
	const markdownList = (list: string[]) => {
		return list.length === 0
			? '- None 🎉'
			: list.map((t) => `- ${t}`).join('\n');
	};

	const head = [
		italic(`This file was generated via \`npm -w cloudquery-tables run diff\``),
		h1('CloudQuery Table Report'),
	];

	const body = result.flatMap((item) => {
		const { name, version, validTables, removedTables, availableTables } = item;
		return [
			h2(`${name} v${version}`),

			h3('Removed tables'),
			italic(
				'Tables that were being collected but no longer exist in the CloudQuery plugin.',
			),
			markdownList(removedTables),
			'\n',

			h3('Collected tables'),
			italic('Tables that will continue to be collected.'),
			markdownList(validTables),
			'\n',

			h3('Available tables'),
			italic('Tables that can be collected.'),
			markdownList(availableTables),
			'\n',
		];
	});
	return tsMarkdown([head, body].flat());
}

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

	const report = createReport(result);

	fs.writeFileSync(path.join(__dirname, '../../cq-docs/REPORT.md'), report, {
		encoding: 'utf-8',
	});

	const removed = result.flatMap((_) => _.removedTables);

	if (removed.length > 0) {
		throw new Error(`${removed.length} tables were removed.`);
	}
}
