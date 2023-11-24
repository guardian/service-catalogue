import { homedir } from 'os';
import { config } from 'dotenv';
import { getConfig } from './config';
import { assessRepo } from './index';

config({ path: `${homedir()}/.gu/service_catalogue/.env.local` });
const testRepo = 'interactive-house-affordability-nov-2023';
const devConfig = getConfig();
void (async () => await assessRepo(testRepo, 'guardian', devConfig))();
