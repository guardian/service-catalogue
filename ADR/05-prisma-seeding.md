# Local Development Environment Seeding

## Status

Proposed.

## Context

We run Service Catalogue projects locally by spinning up a Postgres database in a container, and testing against that.

For local development, the database needs enough representative data to:

- apply Prisma migrations successfully
- support local execution of packages and queries
- provide a baseline for local debugging and development
- allow further local population by CloudQuery where required.

The local development environment (`dev-environment`) previously populated its database by copying selected tables from CODE using a dedicated `db-copy` container.

It now uses Prisma in the `common` package, including a seed script at `packages/common/prisma/seed.ts`.

This ADR records the decision to move local database initialisation away from copying CODE data and towards Prisma seeding.

## Positions

### 1. Continue copying data from CODE using a `db-copy` container

In this implementation, the local database is populated by copying selected tables from the CODE environment.

#### Advantages

- Uses production-like data.
- Requires less effort to design and maintain synthetic seed fixtures.
- Can expose issues that only appear with large or messy real-world datasets.

#### Disadvantages

- Couples local development to VPN access, CODE availability and credentials.
- Makes the local starting dataset non-deterministic.
- Risks local failures if copied tables drift from the current schema or application expectations.
- Adds operational complexity through an extra container and data-copy process.
- Makes local debugging and test reproduction less reliable.
- Brings more production-derived data into local environments than is necessary.
- Allowing developers (and by extension, AIs) access to this database poses a security risk.

### 2. Seed the local database using Prisma

In this implementation, Prisma migrations are applied locally and a seed script inserts a small, representative dataset into Postgres.

The seed data includes the minimum records needed for local development, such as:

- GitHub repositories
- teams and ownership
- branches
- languages
- GitHub workflows
- derived workflow usage rows
- selected AWS resources
- local-only helpers (where required by dependent views).

#### Advantages

- The development environment no longer depends on the VPN or copying from CODE.
  Local startup is simpler and more self-contained.
- Data is deterministic and reproducible.
- Seed data can be reviewed and versioned alongside schema changes.
- Developers can evolve the local dataset intentionally to cover specific scenarios.
- Deterministic data makes E2E and integration testing much simpler, something we only do manually at the moment.

#### Disadvantages

- Seed data is less representative than real CODE data.
- New schema or feature changes may require seed maintenance.
- Some issues caused by scale or unusual production data may not be visible locally.

### 3. Rely only on local CloudQuery syncs

In this implementation, the local database starts empty and CloudQuery is responsible for populating local data.

#### Advantages

- Avoids maintaining synthetic seed data.
- Uses real source systems rather than copied data.

#### Disadvantages

- Local startup is slower.
- Developers still depend on external systems and credentials.
- Some source tables are very large, so a local CloudQuery sync may take a long time and consume more local compute and database resources than is reasonable for routine development.
- Depending on the source and environment, repeated local syncs may also create unnecessary operational cost.
- Some tables used by local development are derived or application-owned rather than directly synced.
- A fully empty starting point makes local development and testing less predictable.

### 4. Restore local data from a scheduled Postgres dump

Here, a PostgreSQL dump of a representative environment is created on a schedule with pg_dump and stored in S3. Local development restores that dump into the local Postgres database during startup or setup.

#### Advantages

- Uses real data rather than synthetic fixtures.
- Can make local development more reflective of CODE or PROD-derived data because more tables and relationships are populated.
- Reduces the need to design and maintain Prisma seed fixtures by hand.
- Decouples local setup from direct runtime access to CODE at startup time, since developers restore from a stored dump rather than copying live data.
- A scheduled dump can provide a reasonably current dataset without requiring every developer to connect to source systems directly.

#### Disadvantages

- Reintroduces dependency on production-derived or environment-derived data, including the associated security, privacy and access-control risks.
- Makes local datasets less deterministic than Prisma seeding, especially as dumps are refreshed over time.
- Still introduces operational infrastructure to create, store, retain and restore dumps.
- Dumps may drift from the current local schema or migration state, especially if the dump source and local code are not aligned.
- Restoring a full or partial dump may be slower and heavier than inserting a small deterministic seed dataset.
- Developers may need different dump sizes or sanitisation rules, which adds maintenance outside the application codebase.
- A scheduled dump can still become stale between refreshes, and increasing refresh frequency increases operational cost and complexity.
- If the dump contains all or most tables, local development may depend on significantly more data than is actually needed for routine iteration and debugging.
- Large dumps may consume substantial local disk, database capacity and restore time.

## Decision

Use Prisma seeding to initialise the local development database.

The local development flow will:

1. start local Postgres
2. apply Prisma migrations
3. generate the Prisma client
4. run `prisma db seed` to insert a representative local dataset
5. start supporting containers such as CloudQuery and Grafana

This replaces the previous `db-copy` approach for local development.

The seeded dataset should remain intentionally small and focused on supporting local development, rather than mirroring CODE in full.

We chose Prisma seeding because it keeps the local dataset deterministic and versioned in the repo, without adding extra operational or data-governance overhead.

## Consequences

### Positive

- Local development is more reliable, reproducible and faster.
- Setup is simpler, with fewer environment-specific dependencies.
- Schema and seed data now evolve together in the repository.
- Local debugging is easier because the initial dataset is known.

### Negative

- Seed data must be maintained as the schema and local use-cases evolve.
- Local behaviour may differ from CODE where production data shape or volume matters.
- Additional fixtures may be needed over time to cover new scenarios.

## Out of scope

This decision applies to local development only.

It does not change:

- production data collection
- CloudQuery’s role in collecting live data
- how CODE or PROD environments are populated
- the design of application-owned runtime tables beyond what is needed for local seeding.
