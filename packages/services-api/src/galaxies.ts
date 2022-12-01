import type { S3Client } from '@aws-sdk/client-s3';
import { getObject } from '../../common/src/aws/s3';

// GalaxyPerson is a person record from Galaxies.
export interface GalaxyPerson {
	name: string;
	emailId: string;
	role: string;
	streams: string[];
	teams: string[];
	githubUsername: string; // Note, this doesn't (yet) exist in actual Galaxies.
}

export interface GalaxyTeam {
	teamName: string;
	teamDescription: string;
	teamContactEmail: string;
	teamGoogleChatSpaceKey: string;
	id: string; // Note, this doesn't (yet) exist in actual Galaxies.
	primaryGithubTeam: string; // Note, this doesn't (yet) exist in actual Galaxies.
}

export interface GalaxiesApi {
	getPeople(): Promise<GalaxyPerson[]>;
	getTeams(): Promise<GalaxyTeam[]>;
	getTeam(teamId: string): Promise<GalaxyTeam>;
}

// Galaxies isn't machine-accessible yet so this is an implementation that just
// reads from S3, which we've copied the data into. Longer-term we hope to
// replace this with direct API calls instead.
export class S3GalaxiesApi implements GalaxiesApi {
	readonly client: S3Client;
	readonly bucket: string;

	constructor(s3Client: S3Client, bucket: string) {
		this.client = s3Client;
		this.bucket = bucket;
	}
	async getTeam(teamId: string): Promise<GalaxyTeam> {
		const teams = await this.getTeams();
		const team = teams.find((team) => team.id === teamId);

		if (team === undefined) {
			throw new Error(`team ${teamId} not found!`);
		}

		return team;
	}

	async getPeople(): Promise<GalaxyPerson[]> {
		const resp = await getObject<GalaxyPerson[]>(
			this.client,
			this.bucket,
			'people.json',
		);

		const people = resp.payload;

		const mappingResp = await getObject<Record<string, string>>(
			this.client,
			this.bucket,
			'people-mapping.json',
		);

		const peopleMapping = mappingResp.payload;

		// Add the (for now) missing fields.
		return people.map((person) => ({
			...person,
			githubUsername: peopleMapping[person.emailId] ?? 'unknown',
		}));
	}

	async getTeams(): Promise<GalaxyTeam[]> {
		const resp = await getObject<Record<string, GalaxyTeam>>(
			this.client,
			this.bucket,
			'teams.json',
		);

		const teams = resp.payload;

		const mappingResp = await getObject<Record<string, string>>(
			this.client,
			this.bucket,
			'teams-mapping.json',
		);

		const teamsMapping = mappingResp.payload;

		return Object.entries(teams).map(([id, team]) => {
			return {
				...team,

				// Note, this doesn't (yet) exist in actual Galaxies.
				// Add them (for now).
				id,
				primaryGithubTeam: teamsMapping[id] ?? 'unknown',
			};
		});
	}
}

// We want:
// Cloudformation stack
// -> github repo
// -> admin team // Feels like a weak link, this may not map 1-2-1. So generate these automatically eventually.
// -> P+E people
//   -> with github usernames

// If your info is wrong, please update the spreadsheet! (nice DX here).
// But what about longer-term updates? - add to the mega spreadsheet + galaxies.

// Script to push spreadsheet data to S3 bucket.
