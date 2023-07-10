import { Client } from 'ts-postgres';
import { config } from './config';
import { configureLogging } from './logger';

export const main = async () => {
	const {
		logLevel,
		database: { host, user, password },
		differenceInDays,
	} = config;

	// Configure the logger first, so any calls to `console.log`, `console.warn` etc. are filtered as necessary.
	configureLogging(logLevel);

	const client = new Client({ host, user, password });

	try {
		await client.connect();
		console.log(`Connected to database`);

		const result = await client.query(
			`SELECT full_name FROM github_repositories WHERE GREATEST(pushed_at, updated_at) > NOW() - INTERVAL '${differenceInDays} days'`,
		);

		const repositories = [];
		for await (const row of result) {
			repositories.push(row.get('full_name'));
		}

		console.log(
			`Repositories updated in the last ${differenceInDays} days: ${repositories.length}`,
		);
		console.debug(repositories.join(','));
	} finally {
		await client.end();
	}
};
