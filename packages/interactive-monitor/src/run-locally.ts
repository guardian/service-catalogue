import { homedir } from 'os';
import { config } from 'dotenv';
import { getConfig } from './config.js';
import { assessRepo } from './index.js';

config({ path: `../../.env` }); // Load `.env` file at the root of the repository
config({ path: `${homedir()}/.gu/service_catalogue/.env.local` });

const testRepo1 = 'ofm-awards-label-2019-atom';
const testRepo2 = 'oz-230101-wildfires';
const devConfig = getConfig();
void assessRepo(testRepo1, devConfig);
void assessRepo(testRepo2, devConfig);
