import { fromIni } from '@aws-sdk/credential-providers';
import type { AwsCredentialIdentityProvider } from '@smithy/types';

interface AwsClientConfig {
	region: string;
	credentials?: AwsCredentialIdentityProvider;
}

export function awsClientConfig(stage: string): AwsClientConfig {
	return {
		/*
		Whilst this _should_ be dynamic, in reality we only use this region, so hardcode it.
	 	*/
		region: 'eu-west-1',

		/*
		If DEV (i.e. running locally), get credentials from the ini file.
		Else, use the standard SDK behaviour of locating credentials through a chain of locations.

		See https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-credential-providers/.
	 */
		...(stage === 'DEV' && {
			credentials: fromIni({ profile: 'deployTools' }),
		}),
	};
}