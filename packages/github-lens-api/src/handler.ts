import path from 'path';
import serverlessExpress from '@vendia/serverless-express';
import { getObject, getS3Client } from 'common/aws/s3';
import type { Repository } from 'common/github/github';
import { configureLogging } from 'common/log/log';
import { buildApp } from './app';
import { getConfig } from './config';

const config = getConfig();
const s3Client = getS3Client(config.region);

configureLogging(config.logLevel);

const repoFileLocation = path.join(config.dataKeyPrefix, 'repos.json');

// Optimise static initialisation by creating promise to load repoData up front:
// https://docs.aws.amazon.com/lambda/latest/operatorguide/static-initialization.html
const repoData: Promise<Repository[]> = getObject<Repository[]>(
	s3Client,
	config.dataBucketName,
	repoFileLocation,
);

const app = buildApp(repoData);

if (process.env.LOCAL === 'true') {
	const PORT = 3232;
	app.listen(PORT, () => {
		console.log(`Listening on port ${PORT}`);
		console.log(`Access via http://localhost:${PORT}`);
	});
}

export const main = serverlessExpress({ app });
