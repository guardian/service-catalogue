import { PrismaClient } from '@prisma/client';
import { evaluateTaggingObligation } from './tagging';

const Mck = typeof jest.MockedClass;

jest.mock('@prisma/client');

const ABD = PrismaClient as jest.MockedClass<typeof PrismaClient>;

beforeEach(() => {
	ABD.mockClear();
});

describe('The tagging obligation', () => {
	it('catches missing Stack tags', async () => {
		const test = new ABD();

		const results = await evaluateTaggingObligation(test);

		console.log(results);
	});
});
