import { Obligations } from './obligations/index.js';
import { main } from './index.js';

const [, , obligation] = process.argv;

if (obligation) {
	void main(obligation);
} else {
	Obligations.forEach((obligation) => {
		void main(obligation);
	});
}
