import { main } from './index';

if (require.main === module) {
	void main({
		severities: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATION'],
	}); // Using all severities in DEV for more data.
}
