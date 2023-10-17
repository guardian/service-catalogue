import yargs from 'yargs';
import {
	getEcsClient,
	getSsmClient,
	listTasks,
	runAllTasks,
	runOneTask,
} from './aws';

const Commands = {
	list: 'list-tasks',
	run: 'run-task',
	runAll: 'run-all-tasks',
};

const parseCommandLineArguments = () => {
	return Promise.resolve(
		yargs
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
				const { stack, stage, app, name } = argv;
				const ecsClient = getEcsClient();
				const ssmClient = getSsmClient();
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
			default:
				throw new Error(`Unknown command ${command ?? ''}`);
		}
	})
	.then((commandResponse) => {
		if (typeof commandResponse === 'number') {
			process.exitCode = commandResponse;
		} else {
			console.log(JSON.stringify(commandResponse, null, 2));
		}
	})
	.catch((err) => {
		console.error(err);
		process.exitCode = 1;
	});
