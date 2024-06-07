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

		expect(results).toHaveLength(0);
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

		expect(results).toHaveLength(1);
		expect(results[0]).toEqual({
			resource: 'arn:aws:s3:::mybucket',
			reason: "Resource missing 'Stack' tag.",
			contacts: { aws_account: '123456789012' },
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

		expect(results).toHaveLength(1);
		expect(results[0]).toEqual({
			resource: 'arn:aws:s3:::mybucket',
			reason: "Resource missing 'Stage' tag.",
			contacts: { aws_account: '123456789012' },
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

		expect(results).toHaveLength(1);
		expect(results[0]).toEqual({
			resource: 'arn:aws:s3:::mybucket',
			reason: "Resource missing 'App' tag.",
			contacts: { aws_account: '123456789012' },
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

		expect(results).toHaveLength(1);
		expect(results[0]).toEqual({
			resource: 'arn:aws:s3:::mybucket',
			reason: "Resource missing 'gu:repo' tag.",
			contacts: { aws_account: '123456789012' },
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

		expect(results).toHaveLength(4);
		expect(results[0]).toEqual({
			resource: 'arn:aws:s3:::mybucket',
			reason: "Resource missing 'Stack' tag.",
			contacts: { aws_account: '123456789012' },
		});
	});
});
