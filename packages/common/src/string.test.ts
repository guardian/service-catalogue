import { stripMargin } from './string';

describe('stripMargin', () => {
	it('should strip the margin from a string', () => {
		const message = stripMargin`
      |Hello
      |From
      |The Guardian`;
		expect(message).toEqual('Hello\nFrom\nThe Guardian');
	});
});
