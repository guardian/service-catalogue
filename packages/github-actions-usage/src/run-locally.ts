import { config } from 'dotenv';
import { main } from './index';

// Read the .env file from the repository root
config({ path: `../../.env` });

void main();
