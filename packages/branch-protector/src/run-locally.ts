import type { UpdateBranchProtectionEvent } from './model';
import { main } from './index';

if (require.main === module) {
	const input: UpdateBranchProtectionEvent = {
		fullName: 'guardian/service-catalogue',
		teamNameSlugs: ['devx-operations', 'devx-security'],
	};

	void (async () => await main(input))();
}
