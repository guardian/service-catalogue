import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { main } from './index.js';

// Read the .env file from the repository root
config({ path: `../../.env` });

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
