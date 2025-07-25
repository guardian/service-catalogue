import { config } from 'dotenv';
import { main } from './index.js';

// Read the .env file from the repository root
config({ path: `../../.env` });

if (import.meta.url === `file://${process.argv[1]}`) {
    void main();
}
