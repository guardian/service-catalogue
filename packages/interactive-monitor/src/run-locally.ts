import { homedir } from 'os';
import { config } from 'dotenv';
import { getConfig } from './config';
import { assessRepo } from './index';

config({ path: `../../.env` }); // Load `.env` file at the root of the repository
config({ path: `${homedir()}/.gu/service_catalogue/.env.local` });

const testRepo = 'ofm-awards-label-2019-atom';
const devConfig = getConfig();
void (async () => await assessRepo(testRepo, 'guardian', devConfig))();
