import * as dotenv from 'dotenv';
import { decrypt } from './aws/kms';

dotenv.config({ path: `${__dirname}/../../../.env` });

export type Stage = `INFRA` | 'DEV';

export const mandatoryEncrypted = async (
	item: string,
	keyId: string,
): Promise<string> => {
	const config = process.env[item];
	if (!config) {
		throw new Error(`Missing required env var (${item})!`);
	}

	const decryptedConfig = await decrypt(config, keyId);

	if (!decryptedConfig) {
		throw new Error(`Failed to get  (${item})!`);
	}

	return decryptedConfig;
};

export const mandatory = (item: string): string => {
	const config = process.env[item];
	if (!config) {
		throw new Error(`Missing required env var (${item})!`);
	}
	return config;
};

export const optional = (item: string): string | undefined => process.env[item];
export const optionalWithDefault = (item: string, _default: string): string =>
	optional(item) ?? _default;
