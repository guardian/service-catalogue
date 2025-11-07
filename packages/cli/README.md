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

Additional environment variables can be sent to the CloudQuery container via the `--env` flag.
This is useful for providing ad-hoc configuration.

For example, to backfill data for the `AwsCostExplorer` task:

```bash
npm -w cli start -- run-task \
  --stage PROD \
  --name AwsCostExplorer \
  --env START_DATE=2025-02-01 \
  --env END_DATE=2025-02-28
```

> [!NOTE]
> The AWS API for Cost Explorer works best with small time ranges.
> If you need to backfill a large time range, consider multiple invocations with smaller ranges.

#### Debug mode

To run a task with debug logging enabled, use the `--debug` flag:

```bash
npm -w cli start run-task -- --stage CODE --name AwsListOrgs --debug
```

This sets the CloudQuery log level to `debug`, providing more detailed output for troubleshooting.

### Database migrations

```bash
npm -w cli start migrate -- --stage [DEV|CODE|PROD]
```
