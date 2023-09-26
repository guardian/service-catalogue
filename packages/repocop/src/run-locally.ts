import { main } from './index';

if (require.main === module) {
	process.env.STAGE = process.env.LOCAL_STAGE;
	process.env.DATABASE_HOSTNAME = process.env.LOCAL_DB_HOSTNAME;
	process.env.DATABASE_PASSWORD = process.env.LOCAL_DB_PASSWORD;
	process.env.DATABASE_USER = process.env.LOCAL_DB_USER;

	// Set this to 'false' to disable SQL query logging
	process.env.QUERY_LOGGING = 'true';

	void (async () => await main())();
}
