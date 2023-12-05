# CLI
This is a small CLI tool to start an ECS task.
It aims to be simpler than using the AWS web console.

## Usage
This CLI has a few available commands.

See them all via:
```bash
npm -w cli start -- --help
```

### ECS
#### List available tasks
```bash
npm -w cli start list-tasks -- --stage [CODE|PROD]
```

#### Start a task
```bash
npm -w cli start run-task -- --stage [CODE|PROD] --name [TASK_NAME]
```

### Database migrations
```bash
npm -w cli start migrate -- --stage [DEV|CODE|PROD]
```
