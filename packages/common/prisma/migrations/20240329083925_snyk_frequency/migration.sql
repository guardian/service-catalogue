BEGIN;

-- CloudQuery no longer collects data for these Snyk tables, so remove the frequency data for them else alarms will trip
DELETE FROM cloudquery_table_frequency
WHERE table_name IN (
    'snyk_dependencies'
    , 'snyk_groups'
    , 'snyk_group_members'
    , 'snyk_integrations'
    , 'snyk_organization_members'
    , 'snyk_reporting_issues'
    , 'snyk_reporting_latest_issues'
);

-- Remove tables that are no longer collected to avoid querying against stale data
DROP TABLE IF EXISTS snyk_dependencies;
DROP TABLE IF EXISTS snyk_groups;
DROP TABLE IF EXISTS snyk_group_members;
DROP TABLE IF EXISTS snyk_integrations;
DROP TABLE IF EXISTS snyk_organization_members;
DROP TABLE IF EXISTS snyk_reporting_issues;
DROP TABLE IF EXISTS snyk_reporting_latest_issues;

COMMIT;
