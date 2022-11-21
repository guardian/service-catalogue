import type { Stage } from 'common/config';
import { mandatory, optionalWithDefault } from 'common/config';

export interface Config {
	stage: Stage;
	galaxiesTmpBucket: string;
	cloudformationLensUrl: string;
	githubLensUrl: string;
}

export const getConfig = (): Config => {
	return {
		stage: optionalWithDefault('STAGE', 'DEV') as Stage,
		galaxiesTmpBucket: mandatory('GALAXIES_BUCKET_NAME'),
		cloudformationLensUrl: mandatory('CLOUDFORMATION_LENS_URL'),
		githubLensUrl: mandatory('GITHUB_LENS_URL'),
	};
};
