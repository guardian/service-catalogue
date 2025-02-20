BEGIN;

-- Remove the frequency data for deprecated Snyk tables else alarms will trip
DELETE FROM cloudquery_table_frequency
WHERE table_name IN (
    'snyk_issues'
    , 'snyk_projects'
    , 'snyk_sbom'
    , 'snyk_organizations'
);

-- Remove deprecated Snyk tables
DROP TABLE IF EXISTS snyk_issues;
DROP TABLE IF EXISTS snyk_projects;
DROP TABLE IF EXISTS snyk_sbom;
DROP TABLE IF EXISTS snyk_organizations;

COMMIT;
