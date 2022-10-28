import type { Stage } from '../../common/config';
import {
	mandatory,
	mandatoryEncrypted,
	optional,
	optionalWithDefault,
} from '../../common/config';
import type { GitHubConfig } from '../../common/github/github';
import { getLogLevel } from '../../common/log/log';
import type { LogLevel } from '../../common/log/log';

export type Config = {
	dataKeyPrefix: string;
	github: GitHubConfig;
	dataBucketName: string;
	region: string;
	stage: Stage;
	logLevel: LogLevel;
};

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
		dataBucketName: mandatory('DATA_BUCKET_NAME'),
		dataKeyPrefix: optionalWithDefault('DATA_KEY_PREFIX', stage),
		region: optionalWithDefault('AWS_REGION', 'eu-west-1'),
		stage,
		logLevel: getLogLevel(optional('LOG_LEVEL')),
	};
};
