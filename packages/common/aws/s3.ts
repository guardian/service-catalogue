import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const region = 'eu-west-1';
const s3Client = new S3Client({
	region,
});

export const putItem = async <T>(
	key: string,
	body: T,
	dataBucketName: string | undefined,
): Promise<void> => {
	if (dataBucketName) {
		const command = new PutObjectCommand({
			Bucket: dataBucketName,
			Key: key,
			Body: JSON.stringify(body),
			ContentType: 'application/json; charset=utf-8',
			ACL: 'private',
		});

		try {
			await s3Client.send(command);
			console.log('[INFO] Item uploaded to s3 successfully');
		} catch (e) {
			console.log(`[ERROR] ${(e as Error).message}`);
		}
	} else {
		console.log('[WARN] No data bucket configured, skipping putItem');
	}
};
