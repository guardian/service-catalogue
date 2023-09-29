import type { UpdateBranchProtectionEvent } from './model';
import { main } from './index';

if (require.main === module) {
	const input: UpdateBranchProtectionEvent = {
		fullName: 'guardian/service-catalogue',
		slugs: ['devx-operations', 'devx-security'],
	};

	void (async () => await main(input))();
}
