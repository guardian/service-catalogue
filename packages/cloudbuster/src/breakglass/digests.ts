import type { BreakglassUser } from './types.js';

function formatUser(user: BreakglassUser): string {
	const mfaString = user.mfaActive ? '' : 'MFA not active';
	const tagString = user.hasUsernameTag ? '' : 'GoogleUsername tag not present';

	const issues = [mfaString, tagString].filter(Boolean).join(', ');
	return `[${user.user}](${user.userUrl}) - ${issues}.`;
}

export function formatMessage(users: BreakglassUser[]): string {
	return users.map(formatUser).join('\n');
}
