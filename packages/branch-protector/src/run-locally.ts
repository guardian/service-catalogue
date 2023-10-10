import type { UpdateBranchProtectionEvent } from './model';
import { main } from './index';

if (require.main === module) {
	process.env.AWS_PROFILE = 'deployTools';
	process.env.AWS_REGION = 'eu-west-1';

	const input: UpdateBranchProtectionEvent = {
		fullName: 'guardian/service-catalogue',
		teamNameSlugs: ['devx-operations', 'devx-security'],
	};

	void (async () => await main(input))();
}
