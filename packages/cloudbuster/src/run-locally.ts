import { main } from './index';

if (require.main === module) {
	void main({
		// Using all severities in DEV for more data.
		severities: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATION'],
	});
}
