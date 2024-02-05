# RepoCop

RepoCop is a tool to help us discover and apply best practices across our estate.
It is deployed as an AWS Lambda.

See the [Grafana dashboard](https://metrics.gutools.co.uk/d/2uaV8PiIz/repocop?orgId=1) for a definition of the rules and how they are met.

## Running RepoCop locally

Prerequisites:

1. [CloudQuery](../dev-environment/README.md) has populated the local database
2. The prisma migrations have been applied to the local database

```bash
npm -w cli start migrate -- --stage DEV
```

To run RepoCop locally, run:

```bash
npm -w repocop start
```

## How to interact with the database

There are lots of ways of writing/making queries to the database, depending on what you want to optimise for. If you are optimising for memory usage, you might want to make lots of highly targeted queries in each function so objects are small and short lived. We have chosen an approach that minimises side effecting calls, and tries to make them all at the beginning or the end of the lambda. This makes it easier to reason about, and test the code, and if there are any issues connecting to the database, or a particular table, it will fail quickly, wasting the fewest amount of resources.

Our guidelines for interacting with the database are:

1. Only make one call to the database per table
2. Make all calls to the database at the beginning or end of the lambda
3. To reduce memory usage, when creating the query function, only select the columns you need. You can always come back later and select more if you need them.

## Architecture

```mermaid
flowchart TB
    DB[(Cloudquery Database)]
    snyk[Snyk Rest API]
    github[GitHub Rest API]
    cq[CloudQuery Batch Jobs]
    devxDev[Developer on the DevX team]
    dev[P&E Developer]
    repocop[Repocop Lambdas]
    aws[AWS APIs]

    snyk --> |Data from snyk populates \nCloudquery tables|cq
    github --> |Data from snyk populates \nCloudquery tables|cq
    aws --> |Data from snyk populates \nCloudquery tables|cq
    cq --> |Cloudquery writes data to the DB|DB
    DB --> |1. Cloudquery data is used \n to calculate departmental \n compliance with obligations|repocop
    repocop --> |2. Repocop stores compliance \n information about repos as a table \n in the cloudquery DB|DB
    repocop --> |Repocop raises PRs to fix issues, \n that are reviewed by developers|dev
    Grafana --> |Compliance dashboards are used\n by DevX developers to track \n departmental progress towards obligations|devxDev
    repocop --> |Repocop sends notifications of \n events, or warnings to teams\n  via Anghammarad|Anghammarad
    Anghammarad --> |Anghammarad delivers messages \n to developers about changes \n to their systems|dev
    DB --> |Cloudquery data powers \n grafana dashboards|Grafana
    Grafana --> |Compliance dashboards are used \n by developers to track \n their team's progress towards \n obligations. They also have read \n access to raw cloudquery tables.|dev

```
