import { homedir } from 'os';
import { config } from 'dotenv';
import { assessRepo } from './index';

config({ path: `${homedir()}/.gu/service_catalogue/.env.local` });
const testRepo = 'interactive-atom-template-2019'; //'service-catalogue';
void (async () => await assessRepo(testRepo, 'guardian', 'DEV'))();
