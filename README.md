# The Product & Engineering Service Catalogue

A set of APIs cataloging services deployed via AWS CloudFormation, and their
related metadata.

In contrast with [Prism](https://github.com/guardian/prism), which collects data
from a subset of AWS resources, Service Catalogue offers a more complete picture
of production services, as we may provision a resource that Prism doesn't know
about.

## Purpose

The Guardian has hundreds of EC2, lambda, and other services in AWS, each is
built from one of thousands of GitHub repositories, by one of many Product &
Engineering (P&E) teams.

We want to be able to answer the following questions:

- For P&E teams:

  - Which services do I own?
  - Which services follow DevX best practice/use tooling?
  - What does each service cost?
  - Which repo do services come from?
  - What is my service reliability? (time since last incident)

- For the Developer Experience stream:
  - What proportion of all services follow best practice/use tooling?
  - What kinds of technologies are different streams using?
  - What services are costing us the most money?
  - Which teams are struggling with reliability and need more support?
  - Which services belong to specific P&E product teams

## Services

The following packages form part of Service Catalogue.

### 1. Cloudquery

[cloudquery](packages/cloudquery/README.md) is a set of Cloudquery (ECS) tasks to collect the data.

To learn how to use the production cloudquery data, see the [docs](docs/getting-started.md) for an introduction.

To run cloudquery locally, see the package [README](packages/cloudquery/README.md).

#### Updating CloudQuery

To update the version of CloudQuery, and its plugins:

1. Edit the [`.env` file at the root of the repository](.env)
2. [Run CloudQuery locally](packages/cloudquery/README.md) to ensure it works
3. Update the CDK snapshot tests: `npm test --workspace=cdk -- -u`
4. Raise a PR

### 2. Repocop

[repocop](packages/repocop/README.md) is a set of database queries using [Prisma](https://www.prisma.io/) which implements our [best practice recommendations](https://github.com/guardian/recommendations/blob/main/best-practices.md).

To run repocop locally, see the package [README](packages/repocop/README.md). (You will need to have cloudquery running first).
