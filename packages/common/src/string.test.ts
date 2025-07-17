import  assert from 'assert';
import { describe, it } from 'node:test';
import { markdownChecklist, stripMargin } from './string';


void describe('stripMargin', () => {
	void it('should strip the margin from a string', () => {
		const message = stripMargin`
      |Hello
      |From
      |The Guardian`;
		assert.strictEqual(message, 'Hello\nFrom\nThe Guardian');
	});
});

void describe('markdownChecklist', () => {
	void it('should generate a markdown checklist', () => {
		const checklist = markdownChecklist(['item1', 'item2']);
		assert.strictEqual(checklist, '- [ ] item1\n- [ ] item2');
	});
});
