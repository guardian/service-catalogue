import { homedir } from 'os';
import { config } from 'dotenv';
import { assessRepo } from './index';

config({ path: `${homedir()}/.gu/service_catalogue/.env.local` });
const testRepo = 'service-catalogue';
void (async () => await assessRepo(testRepo, 'guardian', 'DEV'))();
