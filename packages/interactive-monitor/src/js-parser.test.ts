import  assert from 'assert';
import { describe, it } from 'node:test';
import { getPathFromConfigFile, parseFileToJS } from './js-parser';

void describe('getPathFromConfigFile', () => {
	void it('should return a valid path from a valid js file', () => {
		const rawFile1 = String.raw`export default {
            title: "Iran protests",
            path: "2022/10/iran-protests"}`;

		const file1 = parseFileToJS(rawFile1)!;

		assert.strictEqual(getPathFromConfigFile(file1), '2022/10/iran-protests');

		const rawFile2 = String.raw`export default {
            title: "Some Title",
            html: '<div id="gv-atom"></div>',
            placeholders: {
                headline: "How the Svelte atom template works",
                standfirst: "This is a description of how the Svelte atom template works",
                paragraphBefore: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam laoreet, enim id consectetur vestibulum, odio nibh efficitur urna, non ornare massa eros vel ante. Suspendisse aliquet rutrum massa quis ornare. Sed elementum vitae mi ac ultricies. Vestibulum tempus pulvinar neque et suscipit. Nulla condimentum ut est in convallis. Ut eleifend ac elit non eleifend. Aenean egestas, velit ac pharetra imperdiet, velit lectus aliquet ligula, ut tristique tellus lectus vel ex. Phasellus eget mi eu ligula elementum venenatis. Quisque viverra ex quis tristique pharetra. Nam vehicula nibh vel tellus pellentesque suscipit. Nunc posuere enim elit, in sagittis velit laoreet consectetur. Integer eget lorem at lacus convallis mattis. Cras ultricies rhoncus vestibulum.",
            },
            path: "2022/10/some-title",
        };`;

		const file2 = parseFileToJS(rawFile2)!;

		const result = getPathFromConfigFile(file2);
		assert.strictEqual(result, '2022/10/some-title');
	});
	void it('should return undefined if the JS file is invalid', () => {
		const rawFile = String.raw`export default {
		    title: "Iran protests",
		    asdf: "2022/10/iran-protests"}`;

		const file = parseFileToJS(rawFile)!;

		assert.strictEqual(getPathFromConfigFile(file), undefined);
	});
	void it('should return undefined if the JS file is empty', () => {
		const rawFile = '';

		const file = parseFileToJS(rawFile)!;

		assert.strictEqual(getPathFromConfigFile(file), undefined);
	});
});
