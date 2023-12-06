# RepoCop
RepoCop is a tool to help us discover and apply best practices across our estate.
It is deployed as an AWS Lambda.

See the [Grafana dashboard](https://metrics.gutools.co.uk/d/2uaV8PiIz/repocop?orgId=1) for a definition of the rules and how they are met.

## Running RepoCop locally
Prerequisites:
1. [CloudQuery](../../packages/cloudquery/README.md) has populated the local database

To run RepoCop locally, run:

```bash
npm -w repocop start
```
