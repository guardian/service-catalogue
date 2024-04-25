import { getObligatronPrismaClient } from '../../lib/db';

export const handler = async () => {
	const prismaClient = await getObligatronPrismaClient();

	// Find all teams in Galaxies
	const teams = await prismaClient.galaxies_teams_table.findMany();

	return teams.map((team) => team.team_id);
};
