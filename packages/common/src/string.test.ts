import { describe, expect, it } from 'vitest';
import { markdownChecklist, stripMargin } from './string';


describe('stripMargin', () => {
	it('should strip the margin from a string', () => {
		const message = stripMargin`
      |Hello
      |From
      |The Guardian`;
		expect(message).toEqual('Hello\nFrom\nThe Guardian');
	});
});

describe('markdownChecklist', () => {
	it('should generate a markdown checklist', () => {
		const checklist = markdownChecklist(['item1', 'item2']);
		expect(checklist).toEqual('- [ ] item1\n- [ ] item2');
	});
});
