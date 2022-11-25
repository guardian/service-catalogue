import path from 'path';
import { getObject, getS3Client } from 'common/aws/s3';
import { configureLogging } from 'common/log/log';
import type { Repository, Team } from 'common/model/github';
import { buildApp } from './app';
import { getConfig } from './config';

const config = getConfig();
const s3Client = getS3Client(config.region);

configureLogging(config.logLevel);

const repoFileLocation = path.join(config.dataKeyPrefix, 'repos.json');
const teamFileLocation = path.join(config.dataKeyPrefix, 'teams.json');

const repoData = getObject<Repository[]>(
	s3Client,
	config.dataBucketName,
	repoFileLocation,
);

const teamData = getObject<Team[]>(
	s3Client,
	config.dataBucketName,
	teamFileLocation,
);

const app = buildApp(repoData, teamData);

const PORT = process.env.PORT ?? '3232';
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
	console.log(`Access via http://localhost:${PORT}`);
});
