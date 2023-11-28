import {
	createSourceFile,
	ScriptKind,
	ScriptTarget,
	type SourceFile,
} from 'typescript';

export function parseFileToJS(input: string): SourceFile | undefined {
	try {
		const sourceFile: SourceFile = createSourceFile(
			'config.json',
			input,
			ScriptTarget.Latest,
			true,
			ScriptKind.JS,
		);
		return sourceFile;
	} catch (e) {
		console.log(e);
		return;
	}
}

export function getPathFromConfigFile(
	sourceFile: SourceFile,
): string | undefined {
	const lines = sourceFile.statements[0]?.getText().split('"'); //[3];
	if (!lines) {
		return;
	}
	const pathIndex = lines.findIndex((line) => line.includes('path'));
	if (pathIndex < 1) {
		return;
	}
	const path = lines[pathIndex + 1];
	return path;
}
