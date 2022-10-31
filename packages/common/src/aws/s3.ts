import type { Readable } from 'stream';
import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';

export const getS3Client = (region: string): S3Client => {
	return new S3Client({
		region,
	});
};

export const putObject = async <T>(
	s3Client: S3Client,
	bucketName: string,
	key: string,
	body: T,
): Promise<void> => {
	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: key,
		Body: JSON.stringify(body),
		ContentType: 'application/json; charset=utf-8',
		ACL: 'private',
	});

	await s3Client.send(command);
	console.info(`Item successfully uploaded to: s3://${bucketName}/${key}`);
};

export const getObject = async <T>(
	s3Client: S3Client,
	bucketName: string,
	key: string,
): Promise<T> => {
	const command = new GetObjectCommand({
		Bucket: bucketName,
		Key: key,
	});

	const response = await s3Client.send(command);
	const bodyStream = response.Body;

	if (!bodyStream) {
		throw new Error(`s3://${bucketName}/${key} is empty`);
	}

	const result = await bodyStream.transformToString();

	console.info(`Item successfully downloaded from: s3://${bucketName}/${key}`);

	return JSON.parse(result) as T;
};
