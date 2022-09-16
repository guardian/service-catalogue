import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/../../.env` });

export type Config = {
	dataKeyPrefix: string;
	github: {
		appId: string;
		appPrivateKey: string;
		appInstallationId: string;
	};
	dataBucketName: string | undefined;
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

export const config: Config = {
	github: {
		appId: mandatory('GITHUB_APP_ID'),
		appPrivateKey: mandatory('GITHUB_APP_PRIVATE_KEY'),
		appInstallationId: mandatory('GITHUB_APP_INSTALLATION_ID'),
	},
	dataBucketName: optional('DATA_BUCKET_NAME'),
	dataKeyPrefix: optionalWithDefault('DATA_KEY_PREFIX', 'DEV/'),
};
