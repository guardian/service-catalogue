import { amigoTables } from './amigo';
import { awsTables } from './aws';
import { endoflifeTables } from './endoflife';
import { fastlyTables } from './fastly';
import { galaxiesTables } from './galaxies';
import { githubLanguagesTables, githubTables } from './github';
import { ns1Tables } from './ns1';
import { riffraffTables } from './riffraff';

/**
 * The tables that are being collected with CloudQuery.
 */
export type CloudQueryTableToSync =
	| (typeof amigoTables)[number]
	| (typeof awsTables)[number]
	| (typeof endoflifeTables)[number]
	| (typeof fastlyTables)[number]
	| (typeof galaxiesTables)[number]
	| (typeof githubTables)[number]
	| (typeof githubLanguagesTables)[number]
	| (typeof ns1Tables)[number]
	| (typeof riffraffTables)[number];

/**
 * The tables that are collected by CloudQuery.
 * This is only intended to be used within tests.
 *
 * @private - only intended for use within tests
 */
export const _cloudQueryTablesToSync: string[] = [
	...amigoTables,
	...awsTables,
	...endoflifeTables,
	...fastlyTables,
	...galaxiesTables,
	...githubTables,
	...githubLanguagesTables,
	...ns1Tables,
	...riffraffTables,
];

export function isCloudQueryTable(
	table: string,
): table is CloudQueryTableToSync {
	return _cloudQueryTablesToSync.includes(table);
}

/**
 * Get a list of tables via a list of regular expression filters.
 */
export function filterCloudQueryTables(
	queries: RegExp[],
): CloudQueryTableToSync[] {
	const matches = _cloudQueryTablesToSync
		.filter((table) => queries.some((regex) => regex.test(table)))
		.sort();

	return matches.filter((_) => isCloudQueryTable(_));
}
