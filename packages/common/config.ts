import * as dotenv from 'dotenv';
import { decrypt } from './aws/kms';

dotenv.config({ path: `${__dirname}/../../.env` });

export type Stage = 'PROD' | 'CODE' | 'DEV';
export type Config = {
	dataKeyPrefix: string;
	github: {
		appId: string;
		appPrivateKey: string;
		appInstallationId: string;
	};
	dataBucketName: string | undefined;
	stage: Stage;
};

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

export const getConfig = async (): Promise<Config> => {
	const configDecryptionKeyId = mandatory('KMS_KEY_ID');
	const appPrivateKey = await mandatoryEncrypted(
		'GITHUB_APP_PRIVATE_KEY',
		configDecryptionKeyId,
	);
	const stage = optionalWithDefault('STAGE', 'DEV') as Stage;

	return {
		github: {
			appId: mandatory('GITHUB_APP_ID'),
			appPrivateKey: appPrivateKey,
			appInstallationId: mandatory('GITHUB_APP_INSTALLATION_ID'),
		},
		dataBucketName: optional('DATA_BUCKET_NAME'),
		dataKeyPrefix: optionalWithDefault('DATA_KEY_PREFIX', stage),
		stage,
	};
};
