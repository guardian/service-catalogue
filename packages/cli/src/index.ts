import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import yargs from 'yargs';
import {
	getEcsClient,
	getSecretsManagerClient,
	getSsmClient,
	listTasks,
	runAllTasks,
	runOneTask,
} from './aws.js';
import { migrateDevDatabase, migrateRdsDatabase } from './database.js';

// Load .env file from repo root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../../.env');
const envLoadResult = dotenv.config({ path: envPath });
if (envLoadResult.error) {
	console.warn(
		`Warning: Could not load .env file from ${envPath}: ${envLoadResult.error.message}`,
	);
} else {
	const expanded = dotenvExpand.expand(envLoadResult);
	if (expanded.error) {
		console.warn(
			`Warning: Could not expand environment variables: ${expanded.error.message}`,
		);
	}
}

const Commands = {
	list: 'list-tasks',
	run: 'run-task',
	runAll: 'run-all-tasks',
	migrate: 'migrate',
};

const parseCommandLineArguments = () => {
	return Promise.resolve(
		yargs(process.argv.slice(2))
			.usage('$0 COMMAND [args]')
			.command(
				Commands.list,
				'List all tasks for a given Stack, Stage and App',
				(yargs) => {
					yargs
						.option('stack', {
							description: 'The Stack tag',
							type: 'string',
							demandOption: true,
							default: 'deploy',
						})
						.option('stage', {
							description: 'The Stage tag',
							choices: ['CODE', 'PROD'],
							demandOption: true,
						})
						.option('app', {
							description: 'The App tag',
							type: 'string',
							demandOption: true,
							default: 'service-catalogue',
						})
						.option('debug', {
							description:
								'Show more information about tasks, such as the ARN, and all their tags',
							type: 'boolean',
							default: false,
						});
				},
			)
			.command(Commands.run, 'Run a single task', (yargs) => {
				yargs
					.option('stack', {
						description: 'The Stack tag of the task to run',
						type: 'string',
						demandOption: true,
						default: 'deploy',
					})
					.option('stage', {
						description: 'The Stage tag of the task to run',
						choices: ['CODE', 'PROD'],
						demandOption: true,
					})
					.option('app', {
						description: 'The App tag of the task to run',
						type: 'string',
						demandOption: true,
						default: 'service-catalogue',
					})
					.option('name', {
						description: 'The Name tag of the task to run',
						type: 'string',
						demandOption: true,
					})
					.option('env', {
						description:
							'An environment variable to pass to the task. Syntax: KEY=VALUE',
						type: 'array',
						demandOption: false,
					});
			})
			.command(Commands.runAll, 'Run all tasks', (yargs) => {
				yargs
					.option('stack', {
						description: 'The Stack tag of the tasks to run',
						type: 'string',
						demandOption: true,
						default: 'deploy',
					})
					.option('stage', {
						description: 'The Stage tag of the tasks to run',
						choices: ['CODE', 'PROD'],
						demandOption: true,
					})
					.option('app', {
						description: 'The App tag of the tasks to run',
						type: 'string',
						demandOption: true,
						default: 'service-catalogue',
					});
			})
			.command(Commands.migrate, 'Run database migrations', (yargs) => {
				yargs
					.option('stage', {
						description: 'Which stage to migrate',
						choices: ['DEV', 'CODE', 'PROD'],
						demandOption: true,
					})
					.option('confirm', {
						description: 'Confirm that you want to run the migration',
						type: 'boolean',
						default: false,
					})
					.option('fromStart', {
						description:
							'Apply migrations from the very start. Requires the _prisma_migrations table to be removed.',
						type: 'boolean',
						default: false,
					});
			})
			.demandCommand(1, '') // just print help
			.help()
			.alias('h', 'help').argv,
	);
};

parseCommandLineArguments()
	.then((argv): Promise<unknown> => {
		const command = argv._[0];
		switch (command) {
			case Commands.list: {
				const { stack, stage, app, debug } = argv;
				const client = getEcsClient();

				const tasks = listTasks(
					client,
					stack as string,
					stage as string,
					app as string,
				);

				return debug
					? tasks
					: tasks.then((tasks) => tasks.map((task) => task['Name']));
			}
			case Commands.run: {
				const { stack, stage, app, name, env } = argv;

				const ecsClient = getEcsClient();
				const ssmClient = getSsmClient();

				if (Array.isArray(env)) {
					const envVars: Record<string, string> = (env as string[])
						.map((str) => str.split('='))
						.reduce((acc, [envKey, envValue]) => {
							return {
								...acc,
								[envKey as string]: envValue,
							};
						}, {});

					return runOneTask(
						ecsClient,
						ssmClient,
						stack as string,
						stage as string,
						app as string,
						name as string,
						envVars,
					);
				}

				return runOneTask(
					ecsClient,
					ssmClient,
					stack as string,
					stage as string,
					app as string,
					name as string,
				);
			}
			case Commands.runAll: {
				const { stack, stage, app } = argv;
				const ecsClient = getEcsClient();
				const ssmClient = getSsmClient();
				return runAllTasks(
					ecsClient,
					ssmClient,
					stack as string,
					stage as string,
					app as string,
				);
			}
			case Commands.migrate: {
				const { stage, confirm, fromStart } = argv;

				switch (stage) {
					case 'DEV': {
						return migrateDevDatabase();
					}
					case 'CODE':
					case 'PROD': {
						const secretsManagerClient = getSecretsManagerClient();
						return migrateRdsDatabase(
							stage as string,
							secretsManagerClient,
							confirm as boolean,
							fromStart as boolean,
						);
					}
					default:
						throw new Error(`Unsupported stage: ${stage as string}`);
				}
			}
			default:
				throw new Error(`Unknown command ${command ?? ''}`);
		}
	})
	.then((commandResponse) => {
		if (commandResponse) {
			if (typeof commandResponse === 'number') {
				process.exitCode = commandResponse;
			} else {
				console.log(JSON.stringify(commandResponse, null, 2));
			}
		}
	})
	.catch((err) => {
		console.error(err);
		process.exitCode = 1;
	});
