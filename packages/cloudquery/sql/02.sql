-- Create users for Grafana CODE and PROD, with readonly access.
-- See https://grafana.com/docs/grafana/latest/datasources/postgres/#database-user-permissions-important

-- Unfortunately Grafana does not support RDS IAM authentication.
-- See https://github.com/grafana/grafana/discussions/48170

CREATE USER grafanareadercode WITH PASSWORD 'REDACTED';
GRANT USAGE ON SCHEMA public TO grafanareadercode;

CREATE USER grafanareaderprod WITH PASSWORD 'REDACTED';
GRANT USAGE ON SCHEMA public TO grafanareaderprod;

-- Provide Grafana with access to any new tables and views as soon as they're created.
SET ROLE cloudquery;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO grafanareadercode;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO grafanareaderprod;
