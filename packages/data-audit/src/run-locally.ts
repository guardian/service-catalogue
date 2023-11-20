import { config } from 'dotenv';
import { main } from './index';

// Read the .env file from the repository root
config({ path: `../../.env` });

if (require.main === module) {
	void (async () => await main())();
}
