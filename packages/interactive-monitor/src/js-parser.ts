import type { Octokit } from 'octokit';
import {
	createSourceFile,
	ScriptKind,
	ScriptTarget,
	type SourceFile,
} from 'typescript';
import type { ContentResponse, FileMetadata } from './types.js';

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
	const lines = sourceFile.statements[0]?.getText().split('"');
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

export async function tryToParseJsConfig(
	octokit: Octokit,
	repo: string,
	owner: string,
): Promise<string | undefined> {
	try {
		const configFile: ContentResponse = await octokit.rest.repos.getContent({
			owner,
			repo,
			path: 'project.config.js',
		});

		const parsedFile = parseFileToJS(
			atob((configFile.data as FileMetadata).content),
		);
		if (!parsedFile) {
			return;
		}
		const path = getPathFromConfigFile(parsedFile);
		return path;
	} catch (e) {
		return;
	}
}
