import { mandatory, optional } from './config';

describe('optional config', function () {
	it('should return undefined if an item does not exist', function () {
		expect(optional('DOES_NOT_EXIST')).toBeUndefined();
	});
	it('should return an existing item', function () {
		process.env.CONFIG_EXISTS = 'value';
		expect(optional('CONFIG_EXISTS')).toBe(process.env.CONFIG_EXISTS);
	});
});

describe('mandatory config', function () {
	it('should throw an error if an item does not exist', function () {
		expect(() => mandatory('DOES_NOT_EXIST')).toThrowError();
	});
	it('should return an existing item', function () {
		process.env.CONFIG_EXISTS = 'value';
		expect(mandatory('CONFIG_EXISTS')).toBe(process.env.CONFIG_EXISTS);
	});
});
