import { main } from './index';

if (require.main === module) {
	void main({
		severities: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATION'],
		subjectPrefix: 'Security Hub Digest (all findings)',
	}); // Using all severities in DEV for more data.
}
