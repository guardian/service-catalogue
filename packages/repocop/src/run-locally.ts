import { homedir } from 'os';
import { config } from 'dotenv';
import { main } from './index.js';

config({ path: `../../.env` }); // Load `.env` file at the root of the repository
config({ path: `${homedir()}/.gu/service_catalogue/.env.local` });

if (import.meta.url === `file://${process.argv[1]}`) {
    void main();
}
