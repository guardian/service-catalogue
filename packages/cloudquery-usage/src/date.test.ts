import assert from 'node:assert';
import { beforeEach, describe, mock, test } from 'node:test';
import { getDateRange } from './date.js';

beforeEach(() => {
	delete process.env['START_DATE'];
	delete process.env['END_DATE'];
	mock.timers.reset();
});

void describe('getDateRange', () => {
	void test('When START_DATE is set, but END_DATE is not', () => {
		process.env['START_DATE'] = '2025-01-01';

		assert.throws(
			() => {
				getDateRange();
			},
			{
				message:
					'When using environment variables, both START_DATE (2025-01-01) and END_DATE (undefined) must be provided.',
			},
		);
	});

	void test('When END_DATE is set, but START_DATE is not', () => {
		process.env['END_DATE'] = '2025-01-01';

		assert.throws(
			() => {
				getDateRange();
			},
			{
				message:
					'When using environment variables, both START_DATE (undefined) and END_DATE (2025-01-01) must be provided.',
			},
		);
	});

	void test('When no env vars are set start=two days ago (midnight), end=yesterday (midnight)', (ctx) => {
		ctx.mock.timers.enable({
			apis: ['Date'],
			now: new Date('2025-01-24T11:12:13.000Z'),
		});

		const actual = getDateRange();

		const expected = {
			start: new Date('2025-01-23T00:00:00.000Z'),
			end: new Date('2025-01-24T00:00:00.000Z'),
		};

		assert.deepEqual(actual, expected);
	});

	void test('When both env vars are set, but START_DATE is invalid, an error is thrown', () => {
		process.env['START_DATE'] = 'not a date string';
		process.env['END_DATE'] = '2025-01-01';

		assert.throws(
			() => {
				getDateRange();
			},
			{
				message: 'Invalid START_DATE: not a date string',
			},
		);
	});

	void test('When both env vars are set, but END_DATE is invalid, an error is thrown', () => {
		process.env['START_DATE'] = '2025-01-01';
		process.env['END_DATE'] = 'not a date string';

		assert.throws(
			() => {
				getDateRange();
			},
			{
				message: 'Invalid END_DATE: not a date string',
			},
		);
	});

	void test('When both env vars are set, but START_DATE is after END_DATE', () => {
		process.env['START_DATE'] = '2025-06-01';
		process.env['END_DATE'] = '2025-01-01';

		assert.throws(
			() => {
				getDateRange();
			},
			{
				message: 'START_DATE must be before END_DATE',
			},
		);
	});

	void test('When both env vars are set and are valid, dates are set to midnight', () => {
		process.env['START_DATE'] = '2024-12-01T01:02:03.000Z';
		process.env['END_DATE'] = '2025-01-01T04:05:06.000Z';

		const actual = getDateRange();

		const expected = {
			start: new Date('2024-12-01T00:00:00.000Z'),
			end: new Date('2025-01-01T00:00:00.000Z'),
		};

		assert.deepEqual(actual, expected);
	});

	void test('When both env vars are set and are valid', () => {
		process.env['START_DATE'] = '2024-12-01';
		process.env['END_DATE'] = '2025-01-01';

		const actual = getDateRange();

		const expected = {
			start: new Date('2024-12-01T00:00:00.000Z'),
			end: new Date('2025-01-01T00:00:00.000Z'),
		};

		assert.deepEqual(actual, expected);
	});
});
