import { homedir } from 'os';
import { config } from 'dotenv';
import { main } from './index';

config({ path: `${homedir()}/.gu/service_catalogue/.env.local` });

if (require.main === module) {
	void (async () => await main())();
}
