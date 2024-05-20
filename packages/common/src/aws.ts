import {
	fromIni,
	fromTemporaryCredentials,
} from '@aws-sdk/credential-providers';
import type { AwsCredentialIdentityProvider } from '@smithy/types';

interface AwsClientConfig {
	region: string;
	credentials?: AwsCredentialIdentityProvider;
}

export function awsClientConfig(
	stage: string,
	roleArn?: string,
	region = 'eu-west-1',
): AwsClientConfig {
	return {
		region,

		/*
		If DEV (i.e. running locally), get credentials from the ini file.
		Else, use the standard SDK behaviour of locating credentials through a chain of locations.

		See https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/.
	 */
		...(stage === 'DEV' && {
			credentials: fromIni({ profile: 'deployTools' }),
		}),

		/*
		If not DEV, and a roleArn is provided, assume that role.
		Cannot do this in DEV as Janus credentials deny role assumptions.
		 */
		...(stage !== 'DEV' &&
			roleArn && {
				credentials: fromTemporaryCredentials({
					params: { RoleArn: roleArn },
				}),
			}),
	};
}

/**
 * A list of all AWS regions.
 */
export const AWS_REGIONS = [
	'us-east-2',
	'us-east-1',
	'us-west-1',
	'us-west-2',
	'af-south-1',
	'ap-east-1',
	'ap-south-2',
	'ap-southeast-3',
	'ap-southeast-4',
	'ap-south-1',
	'ap-northeast-3',
	'ap-northeast-2',
	'ap-southeast-1',
	'ap-southeast-2',
	'ap-northeast-1',
	'ca-central-1',
	'ca-west-1',
	'eu-central-1',
	'eu-west-1',
	'eu-west-2',
	'eu-south-1',
	'eu-west-3',
	'eu-south-2',
	'eu-north-1',
	'eu-central-2',
	'il-central-1',
	'me-south-1',
	'me-central-1',
	'sa-east-1',
];
