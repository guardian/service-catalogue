-- List of all tables to monitor for out of sync issues
-- Ideally we could generate this list automatically, but for now its hardcoded
DROP TABLE IF EXISTS  cloudquery_table_frequency;
CREATE TABLE cloudquery_table_frequency (
     table_name TEXT PRIMARY KEY ,
     frequency TEXT
);
INSERT INTO cloudquery_table_frequency(table_name, frequency) VALUES
    -- AWS
    ('aws_s3_%', 'DAILY'),
    ('aws_accessanalyzer_%', 'DAILY'),
    ('aws_securityhub_%', 'DAILY'),
    ('aws_cloudformation_%', 'DAILY'),
    ('aws_elbv1_%', 'DAILY'),
    ('aws_elbv2_%', 'DAILY'),
    ('aws_acm%', 'DAILY'),
    ('aws_dynamodb%', 'DAILY'),
    ('aws_cloudwatch_alarms', 'DAILY'),
    ('aws_inspector_findings', 'DAILY'),
    ('aws_inspector2_findings', 'DAILY'),
    ('aws_ec2_instances', 'DAILY'),
    ('aws_ec2_security_groups', 'DAILY'),
    ('aws_ec2_images', 'DAILY'),
    ('aws_autoscaling_groups', 'DAILY'),
    ('aws_costexplorer_%', 'WEEKLY'),
    -- Github
    ('github_repositories', 'DAILY'),
    ('github_repository_branches', 'DAILY'),
    ('github_workflows', 'DAILY'),
    ('github_issues', 'DAILY'),
    ('github_organizations', 'WEEKLY'),
    ('github_organization_members', 'WEEKLY'),
    ('github_teams', 'WEEKLY'),
    ('github_team_members', 'WEEKLY'),
    ('github_team_repositories', 'WEEKLY'),
    -- Fastly
    ('fastly_services', 'DAILY'),
    ('fastly_service_versions', 'DAILY'),
    ('fastly_service_backends', 'DAILY'),
    ('fastly_service_domains', 'DAILY'),
    ('fastly_service_health_checks', 'DAILY'),
    -- Galaxies
    ('galaxies_%', 'DAILY'),
    -- Snyk
    ('snyk_dependencies', 'DAILY'),
    ('snyk_groups', 'DAILY'),
    ('snyk_group_members', 'DAILY'),
    ('snyk_integrations', 'DAILY'),
    ('snyk_organizations', 'DAILY'),
    ('snyk_organization_members', 'DAILY'),
    ('snyk_reporting_issues', 'DAILY'),
    ('snyk_reporting_latest_issues', 'DAILY'),
    ('snyk_projects', 'DAILY'),
    -- RiffRaff
    ('riffraff_%', 'DAILY');

-- Check the last sync time of all tables defined by cloudquery_table_frequency
-- and verify that their last sync time matches their frequency
CREATE OR REPLACE FUNCTION cloudquery_table_status()
    RETURNS TABLE(table_name text, last_sync timestamp, frequency text, in_sync boolean) AS
$$
DECLARE
    table_to_check record;
    last_sync timestamp;
BEGIN
    FOR table_to_check IN
        SELECT DISTINCT information_schema.columns.table_name, ctf.frequency
        FROM information_schema.columns
        INNER JOIN cloudquery_table_frequency ctf on columns.table_name LIKE ctf.table_name
        ORDER BY information_schema.columns.table_name
    LOOP
        EXECUTE format('SELECT _cq_sync_time FROM %I LIMIT 1', table_to_check.table_name) INTO last_sync;

        cloudquery_table_status.table_name := table_to_check.table_name;
        cloudquery_table_status.last_sync := last_sync;
        cloudquery_table_status.frequency := table_to_check.frequency;

        -- Unfortunately we rely on rows existing in a table in order to know when it was last synced
        -- in a future iteration we may want to consider adding a rule to require that some tables have data
        -- to be considered "in sync"
        cloudquery_table_status.in_sync := COALESCE(last_sync, NOW()) >=
            CASE
                WHEN table_to_check.frequency = 'DAILY'  THEN NOW() - INTERVAL '36' HOUR
                WHEN table_to_check.frequency = 'WEEKLY' THEN NOW() - INTERVAL '8'  DAY
            END;
        RETURN NEXT;
    END LOOP;
END
$$ LANGUAGE plpgsql;
