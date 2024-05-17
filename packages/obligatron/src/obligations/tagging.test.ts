import type { PrismaClient } from '@prisma/client';
import type { AwsResource } from './tagging';
import { evaluateTaggingObligation } from './tagging';

const createPrismaClientWithMockedResponse = (response: AwsResource[]) => {
	const test = {
		$queryRaw: () => Promise.resolve(response),
	} as unknown as PrismaClient;

	return test;
};

describe('The tagging obligation', () => {
	it('passes correct resource', async () => {
		const client = createPrismaClientWithMockedResponse([
			{
				account_id: '123456789012',
				arn: 'arn:aws:s3:::mybucket',
				service: 's3',
				resource_type: 'bucket',
				taggable: 'true',
				tags: {
					Stack: 'my-stack',
					Stage: 'prod',
					App: 'myapp',
					'gu:repo': 'myrepo',
				},
			},
		]);

		const results = await evaluateTaggingObligation(client);

		expect(results.filter((r) => !r.result)).toHaveLength(0);
		expect(results[0]).toMatchObject({
			resource: 'arn:aws:s3:::mybucket',
			result: true,
			reasons: [],
		});
	});

	it('catches missing Stack tags', async () => {
		const client = createPrismaClientWithMockedResponse([
			{
				account_id: '123456789012',
				arn: 'arn:aws:s3:::mybucket',
				service: 's3',
				resource_type: 'bucket',
				taggable: 'true',
				tags: {
					Stage: 'prod',
					App: 'myapp',
					'gu:repo': 'myrepo',
				},
			},
		]);

		const results = await evaluateTaggingObligation(client);

		expect(results.filter((r) => !r.result)).toHaveLength(1);
		expect(results[0]).toMatchObject({
			resource: 'arn:aws:s3:::mybucket',
			result: false,
			reasons: ["Resource missing 'Stack' tag."],
		});
	});

	it('catches missing Stage tags', async () => {
		const client = createPrismaClientWithMockedResponse([
			{
				account_id: '123456789012',
				arn: 'arn:aws:s3:::mybucket',
				service: 's3',
				resource_type: 'bucket',
				taggable: 'true',
				tags: {
					Stack: 'my-stack',
					App: 'myapp',
					'gu:repo': 'myrepo',
				},
			},
		]);

		const results = await evaluateTaggingObligation(client);

		expect(results.filter((r) => !r.result)).toHaveLength(1);
		expect(results[0]).toMatchObject({
			resource: 'arn:aws:s3:::mybucket',
			result: false,
			reasons: ["Resource missing 'Stage' tag."],
		});
	});

	it('catches missing App tags', async () => {
		const client = createPrismaClientWithMockedResponse([
			{
				account_id: '123456789012',
				arn: 'arn:aws:s3:::mybucket',
				service: 's3',
				resource_type: 'bucket',
				taggable: 'true',
				tags: {
					Stack: 'my-stack',
					Stage: 'prod',
					'gu:repo': 'myrepo',
				},
			},
		]);

		const results = await evaluateTaggingObligation(client);

		expect(results.filter((r) => !r.result)).toHaveLength(1);
		expect(results[0]).toMatchObject({
			resource: 'arn:aws:s3:::mybucket',
			result: false,
			reasons: ["Resource missing 'App' tag."],
		});
	});

	it('catches missing Repo tags', async () => {
		const client = createPrismaClientWithMockedResponse([
			{
				account_id: '123456789012',
				arn: 'arn:aws:s3:::mybucket',
				service: 's3',
				resource_type: 'bucket',
				taggable: 'true',
				tags: {
					Stack: 'my-stack',
					Stage: 'prod',
					App: 'myapp',
				},
			},
		]);

		const results = await evaluateTaggingObligation(client);

		expect(results.filter((r) => !r.result)).toHaveLength(1);
		expect(results[0]).toMatchObject({
			resource: 'arn:aws:s3:::mybucket',
			result: false,
			reasons: ["Resource missing 'gu:repo' tag."],
		});
	});

	it('catches empty tags', async () => {
		const client = createPrismaClientWithMockedResponse([
			{
				account_id: '123456789012',
				arn: 'arn:aws:s3:::mybucket',
				service: 's3',
				resource_type: 'bucket',
				taggable: 'true',
				tags: {
					Stack: '',
					Stage: '',
					App: '',
					'gu:repo': '',
				},
			},
		]);

		const results = await evaluateTaggingObligation(client);

		expect(results.filter((r) => !r.result)).toHaveLength(1);
		expect(results[0]).toMatchObject({
			resource: 'arn:aws:s3:::mybucket',
			result: false,
			reasons: [
				"Resource missing 'Stack' tag.",
				"Resource missing 'Stage' tag.",
				"Resource missing 'App' tag.",
				"Resource missing 'gu:repo' tag.",
			],
		});
	});
});
