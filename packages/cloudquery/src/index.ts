import yargs from 'yargs';
import { getClient, listTasks } from './ecs';

const Commands = {
	list: 'list-tasks',
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
						})
						.option('stage', {
							description: 'The Stage tag',
							type: 'string',
							demandOption: true,
						})
						.option('app', {
							description: 'The App tag',
							type: 'string',
							demandOption: true,
						});
				},
			)
			.demandCommand(1, '') // just print help
			.help()
			.alias('h', 'help').argv,
	);
};

parseCommandLineArguments()
	.then((argv) => {
		const command = argv._[0];
		switch (command) {
			case Commands.list: {
				const { stack, stage, app } = argv;
				const client = getClient();
				return listTasks(
					client,
					stack as string,
					stage as string,
					app as string,
				);
			}
			default:
				throw new Error(`Unknown command ${command ?? ''}`);
		}
	})
	.then((x) => {
		console.log(JSON.stringify(x, null, 2));
	})
	.catch((err) => {
		console.error(err);
		process.exitCode = 1;
	});
