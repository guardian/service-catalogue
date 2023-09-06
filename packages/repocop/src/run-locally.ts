import { main } from './index';

if (require.main === module) {
    // TODO set these values from a .env file.
    //  The .env file should also be used within `docker-compose.yml` to stay DRY.
    process.env.STAGE = 'DEV';
    process.env.DATABASE_HOSTNAME = 'localhost';
    process.env.DATABASE_PASSWORD = 'not_at_all_secret';
    process.env.DATABASE_USER = 'postgres'

    void (async () => await main())();
}
