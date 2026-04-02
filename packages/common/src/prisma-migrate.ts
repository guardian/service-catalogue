import { $ } from 'execa';

export async function main() {
	console.log(`Running prisma migrate deploy`);
	const { stdout } = await $`npx prisma migrate deploy`;
	console.log(stdout);
}

void main();
