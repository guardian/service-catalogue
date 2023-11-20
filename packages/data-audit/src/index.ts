import { getConfig } from './config';

export async function main() {
	const { app, stage } = getConfig();
	const message = `Hello from ${app} (${stage}). The time is ${new Date().toString()}.`;
	console.log(message);
	return Promise.resolve(message);
}
