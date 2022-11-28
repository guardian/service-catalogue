/* eslint-disable @typescript-eslint/no-unsafe-member-access -- For body access which is always any */
import type { Express } from 'express';
import request from 'supertest';
import { buildApp } from './app';
import type { GitHubData } from './data';

describe('github-lens api lambda', () => {
	let app: Express;

	beforeEach(() => {
		const ghData = Promise.resolve<GitHubData>({
			teams: {
				payload: [],
			},
			members: {
				payload: [],
			},
			repos: {
				payload: [],
			}
		})
		app = buildApp(ghData);
	});

	describe('GET /healthcheck', () => {
		it('returns a valid healthcheck', async () => {
			const res = await request(app).get('/healthcheck');
			expect(res.status).toEqual(200);
			expect(res.body.stage).toEqual('INFRA');
		});
	});
});
