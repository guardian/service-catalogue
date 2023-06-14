# CloudQuery Adoption

## Status
Accepted, and implemented.

## Context
The Service Catalogue project aims to "allow easy exploration of Guardian services", allowing one to answer questions such as:
- What services to I (and my team) own?
- Which repository do services come from?
- Which services follow DevX best practice/use tooling?

Initially, the Service Catalogue was architected in two parts:
1. Data collection
   ```mermaid
   flowchart LR
   A["Source(s)"] --> B[Data collector]
   B --> C[(DataStore)]
   ```
2. Data presentation
   ```mermaid
   flowchart LR
   A[(DataStore)] --> B[Lens API]
   B --> C[Service Catalogue API]
   C --> D((User))
   ```

That is, for each data source, we'd build:
- A data collector
- A data aggregation API (informally known as a Lens API)
- Public-facing APIs (informally known as the Service Catalogue API)

To present a piece of data in the Service Catalogue API, we would:
- Create a data collector, integrating with third-party APIs, and writing results to a data store
- Create a Lens API that aggregates the data in the store
- Service Catalogue API endpoints to expose the Lens API to the user

Whilst this pattern works, it results in complex[^1] code that needs to be maintained over time.

## Proposal
[CloudQuery](https://www.cloudquery.io/) is an open-source project to:

> Sync any source to any destination, transform and visualize.

CloudQuery can collect data from AWS, GitHub, Snyk, and more. 
It can also store the data in a variety of destinations, including Postgres.

Using CloudQuery would allow us to replace the first diagram above, 
with the data collection being handled by CloudQuery, and the data store being Postgres.
Using Postgres would allow us to use Grafana to visualise the data.

## Consequences
At a high-level, CloudQuery is a data collection tool.
It doesn't have any opinion on the data it collects,
nor does it provide any APIs to expose the data.
That is, we lose the second diagram above.

If we wanted to provide an API, we'd have to write one ourselves.
However, we should see how far we get with Grafana dashboards first.
API access does still seem valuable, however we will wait to see if there is demand for this.
Tools such as [Prisma](https://www.prisma.io/) could be explored here.

## Out of scope
### Decommissioning Prism
[Prism](https://github.com/guardian/prism) is our home-grown tool that provides a real-time view of particular resources across our AWS estate. 
We can consider the data collected by CloudQuery to be a superset of Prism.

The Prism API is in use by services such as [Riff-Raff](https://github.com/guardian/riff-raff).

Initially, there are no plans to rebuild the Prism API using data collected by CloudQuery.

[^1]: Complexity comes in various forms, for example new programming languages, or handling of third-party API behaviours.
