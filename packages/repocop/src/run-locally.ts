import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { main } from './index.js';

config({ path: `../../.env` }); // Load `.env` file at the root of the repository
config({ path: `${homedir()}/.gu/service_catalogue/.env.local` });

/**
 * checks if the current module is the entry point script - replaces the CommonJs `require.main === module` check
 * `import.meta.url` represents the URL of the current module file, e.g. run-locally.ts
 * `process.argv[1]` represents the path to the script that was executed - it's the second 
argument in the process's argument vector (the first being the Node executable).
*/
const isMain = fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
	void main();
}
