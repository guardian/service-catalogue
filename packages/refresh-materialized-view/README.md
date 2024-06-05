# Refresh Materialized View

A lambda function that refreshes the materialized view `aws_resources`.

## Running locally
With your local environment running, run:

```bash
npm -w refresh-materialized-view start
```

## Running on PROD
This lambda is triggered whenever an ECS task prefixed `Aws` completes successfully.

If necessary, it can also be triggered on-demand without any input.
