import type { UpdateBranchProtectionEvent } from './model';
import {getEnvOrThrow, main} from './index';

if (require.main === module) {
	const workspaceId = getEnvOrThrow('DEVX_WORKSPACE_ID');
	const input: UpdateBranchProtectionEvent = {
		fullName: 'guardian/service-catalogue',
		teamContacts: [
			{ slug: 'devx-operations', workspaceId: workspaceId },
			{ slug: 'devx-security', workspaceId: workspaceId },
		],
	};

	void (async () => await main(input))();
}
