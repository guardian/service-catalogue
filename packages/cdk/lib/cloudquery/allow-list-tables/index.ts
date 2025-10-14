import { amigoTables } from './amigo-table-list';
import { awsTables } from './aws-table-list';
import { endoflifeTables } from './endoflife-table-list';
import { fastlyTables } from './fastly-table-list';
import { galaxiesTables } from './galaxies-table-list';
import { githubTables } from './github-table-list';
import { ns1Tables } from './ns1_table_list';
import { riffraffTables } from './riffraff-table-list';

export const availableCloudQueryTables = [
	...amigoTables,
	...awsTables,
	...endoflifeTables,
	...fastlyTables,
	...galaxiesTables,
	...githubTables,
	...ns1Tables,
	...riffraffTables,
];
