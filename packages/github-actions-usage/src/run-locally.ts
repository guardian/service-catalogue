import { loadEnvFile } from 'node:process';
import { main } from './index.js';

// Read the .env file from the repository root
loadEnvFile(`../../.env`);

void main();
