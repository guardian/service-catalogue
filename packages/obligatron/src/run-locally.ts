import { loadEnvFile } from 'node:process';
import { Obligations } from './obligations/index.js';
import { main } from './index.js';

loadEnvFile('../../.env'); // Load `.env` file at the root of the repository

const [, , obligation] = process.argv;

if (obligation) {
	void main(obligation);
} else {
	Obligations.forEach((obligation) => {
		void main(obligation);
	});
}
