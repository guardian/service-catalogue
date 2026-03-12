import { loadEnvFile } from 'node:process';
import { homedir } from 'os';
import { getConfig } from './config.js';
import { assessRepos } from './index.js';

loadEnvFile('../../.env'); // Load `.env` file at the root of the repository
loadEnvFile(`${homedir()}/.gu/service_catalogue/.env.local`);

const testRepos = ['ofm-awards-label-2019-atom', 'oz-230101-wildfires'];
const devConfig = getConfig();
if (import.meta.url === `file://${process.argv[1]}`) {
	void assessRepos(testRepos, devConfig);
}
