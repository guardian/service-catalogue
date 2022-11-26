
import { getS3Client  } from 'common/aws/s3';
import { configureLogging } from 'common/log/log';
import { buildApp } from './app';
import { getConfig } from './config';
import { retrieveData } from './data'

const config = getConfig();
const s3Client = getS3Client(config.region);

configureLogging(config.logLevel);

const ghData = retrieveData(s3Client, config.dataBucketName, config.dataKeyPrefix);
const app = buildApp(ghData);

const PORT = process.env.PORT ?? '3232';
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
	console.log(`Access via http://localhost:${PORT}`);
});
