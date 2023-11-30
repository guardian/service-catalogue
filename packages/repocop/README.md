# Repocop

Repocop is a tool to help us discover and apply best practices across our estate. See the [Grafana dashboard](https://metrics.gutools.co.uk/d/2uaV8PiIz/repocop?orgId=1) for a definition of the rules and how they are met.

Repocop uses the [Prisma](https://www.prisma.io) ORM for database migrations in order to profit from the audit
trail it provides.

## Database migrations with Prisma

The migration process is currently manual.

Migration history is held in the `packages/common/prisma/migrations` directory in this repository and the `_prisma_migrations` table in the
database.

For more details, see the [Prisma Migrations](../common/README.md).


