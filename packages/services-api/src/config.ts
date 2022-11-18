import type { Stage } from 'common/config';
import { mandatory, optionalWithDefault } from 'common/config';

export interface Config {
	stage: Stage;
	galaxiesTmpBucket: string;
}

export const getConfig = (): Config => {
	return {
		stage: optionalWithDefault('STAGE', 'DEV') as Stage,
		galaxiesTmpBucket: mandatory('GALAXIES_BUCKET_NAME'),
	};
};
