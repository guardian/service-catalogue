import { config } from 'dotenv';
import { main } from './index';

// eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- on a dev machine we can be pretty sure there is a home directory
config({ path: `${process.env.HOME}/.gu/service_catalogue/.env.local` });

if (require.main === module) {
	process.env.STAGE = process.env.LOCAL_STAGE;
	process.env.DATABASE_HOSTNAME = process.env.LOCAL_DB_HOSTNAME;
	process.env.DATABASE_PASSWORD = process.env.LOCAL_DB_PASSWORD;
	process.env.DATABASE_USER = process.env.LOCAL_DB_USER;

	// Set this to 'false' to disable SQL query logging
	process.env.QUERY_LOGGING = 'true';

	void (async () => await main())();
}
