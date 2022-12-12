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
		cloudformationLensUrl: 'https://cloudformation-lens.gutools.co.uk',
		githubLensUrl: 'https://github-lens.gutools.co.uk',
	};
};
