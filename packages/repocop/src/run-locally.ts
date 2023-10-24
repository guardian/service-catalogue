import { config } from 'dotenv';
import { main } from './index';

// eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- on a dev machine we can be pretty sure there is a home directory
config({ path: `${process.env.HOME}/.gu/service_catalogue/.env.local` });

if (require.main === module) {
	void (async () => await main())();
}
