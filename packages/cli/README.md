# CLI
This is a small CLI tool to start an ECS task.
It aims to be simpler than using the AWS web console.

## Usage
There are two primary use-cases:

### List available tasks
```bash
npm -w cli start list-tasks -- --stage [CODE|PROD]
```

### Start a task
```bash
npm -w cli start run-task -- --stage [CODE|PROD] --name [TASK_NAME]
```

The full CLI can be described via the `--help` flag:
```bash
npm -w cli start -- --help
```
