import { Readable } from 'stream';
import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@aws-sdk/util-stream-node';
import { mockClient } from 'aws-sdk-client-mock';
import { getObject, getS3Client, putObject } from './s3';

const s3Mock = mockClient(S3Client);

beforeEach(() => {
	s3Mock.reset();
});

describe('getObject', function () {
	it('downloads and JSON parses objects stored in S3', async function () {
		const responseBody = sdkStreamMixin(new Readable());
		const expectedDate = new Date('01/01/2020');

		const expectedPayload = {
			foo: 'bar',
			bat: 'baz',
		};
		const expectedRetrievedObject = {
			payload: expectedPayload,
			lastModified: expectedDate,
		};

		responseBody.push(JSON.stringify(expectedPayload));
		responseBody.push(null);

		s3Mock.on(GetObjectCommand).resolves({
			Body: responseBody,
			LastModified: expectedDate,
		});

		const s3Client = getS3Client('eu-west-1');
		const retrievedObject = await getObject(s3Client, 'bucket', 'key');

		expect(expectedRetrievedObject).toStrictEqual(retrievedObject);
	});
});

describe('putObject', function () {
	it('uploads and serializes to JSON objects stored in S3', async function () {
		const expectedData = {
			foo: 'bar',
			bat: 'baz',
		};

		s3Mock.on(PutObjectCommand).resolves({});

		const s3Client = getS3Client('eu-west-1');
		await putObject(s3Client, 'bucket', 'key', expectedData);

		const s3PutObjectStub = s3Mock.commandCalls(PutObjectCommand);

		expect(s3PutObjectStub[0].args[0].input).toEqual({
			Bucket: 'bucket',
			Key: 'key',
			Body: JSON.stringify(expectedData),
			ContentType: 'application/json; charset=utf-8',
			ACL: 'private',
		});
	});
});
