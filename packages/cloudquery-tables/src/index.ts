import { amigoTables } from './amigo';
import { awsTables } from './aws';
import { endoflifeTables } from './endoflife';
import { fastlyTables } from './fastly';
import { galaxiesTables } from './galaxies';
import { githubLanguagesTables, githubTables } from './github';
import { ns1Tables } from './ns1';
import { riffraffTables } from './riffraff';

export const cloudQueryTablesToSync = [
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
