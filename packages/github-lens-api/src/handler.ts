import path from 'path';
import { getObject, getS3Client } from 'common/aws/s3';
import { configureLogging } from 'common/log/log';
import type { Repository } from 'common/model/repository';
import { buildApp } from './app';
import { getConfig } from './config';

const config = getConfig();
const s3Client = getS3Client(config.region);

configureLogging(config.logLevel);

const repoFileLocation = path.join(config.dataKeyPrefix, 'repos.json');

// Optimise static initialisation by creating promise to load repoData up front:
// https://docs.aws.amazon.com/lambda/latest/operatorguide/static-initialization.html
const repoData = getObject<Repository[]>(
	s3Client,
	config.dataBucketName,
	repoFileLocation,
);

const app = buildApp(repoData);

const PORT = process.env.PORT ?? '3232';
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
	console.log(`Access via http://localhost:${PORT}`);
});
