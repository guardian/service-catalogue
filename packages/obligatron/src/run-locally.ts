import { Obligations } from './obligations';
import { main } from './index';

const [, , obligation] = process.argv;

if (obligation) {
	void main(obligation);
} else {
	Obligations.forEach((obligation) => {
		void main(obligation);
	});
}
