-- Following the switch to an allowlist of tables, we no longer collect tables with wildcards.
-- This migration removes entries from `cloudquery_table_frequency` for the wildcard tables to improve our monitoring and dashboards.
BEGIN TRANSACTION;
    DELETE FROM cloudquery_table_frequency WHERE table_name LIKE '%\%';
COMMIT;