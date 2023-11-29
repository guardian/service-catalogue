import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';

export type ContentResponse =
	RestEndpointMethodTypes['repos']['getContent']['response'];

export interface FileMetadata {
	name: string;
	content: string;
}

export interface ConfigJsonFile {
	path: string;
}
