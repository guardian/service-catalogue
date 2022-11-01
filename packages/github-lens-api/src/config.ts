import type { Stage } from 'common/config';
import { mandatory, optional, optionalWithDefault } from 'common/config';
import { getLogLevel } from 'common/log/log';
import type { LogLevel } from 'common/log/log';

export type Config = {
	dataKeyPrefix: string;
	dataBucketName: string;
	region: string;
	stage: Stage;
	logLevel: LogLevel;
};

export const getConfig = (): Config => {
	const stage = optionalWithDefault('STAGE', 'DEV') as Stage;

	return {
		dataBucketName: mandatory('DATA_BUCKET_NAME'),
		dataKeyPrefix: optionalWithDefault('DATA_KEY_PREFIX', stage),
		region: optionalWithDefault('AWS_REGION', 'eu-west-1'),
		stage,
		logLevel: getLogLevel(optional('LOG_LEVEL')),
	};
};
