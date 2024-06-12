-- Replace all views with functions. This allows Cloudquery to update the schema of underlying tables without running into postgres limitations.
-- This has the downside that breaking changes in table schemas will break at runtime, instead of deploy time
--
-- Views now point to the functions. This allows tools which don't support Functions, such a Prisma, 
-- to keep working and also provides existing dashboards with backwards compatibility. 

DROP VIEW IF EXISTS view_repo_ownership;
DROP FUNCTION IF EXISTS fn_repo_ownership();

DROP VIEW IF EXISTS view_running_instances;
DROP FUNCTION IF EXISTS fn_running_ec2_instances();

DROP VIEW IF EXISTS view_old_ec2_instances;
DROP FUNCTION IF EXISTS fn_old_ec2_instances();

DROP VIEW IF EXISTS aws_accounts;
DROP FUNCTION IF EXISTS fn_aws_accounts();

DROP VIEW IF EXISTS view_github_actions;
DROP FUNCTION IF EXISTS fn_github_actions();

-- Repo Ownership

CREATE OR REPLACE FUNCTION fn_repo_ownership() RETURNS TABLE(github_team_id BIGINT, github_team_name TEXT, github_team_slug TEXT, short_repo_name TEXT, full_repo_name TEXT, role_name TEXT, archived BOOL, galaxies_team TEXT, team_contact_email TEXt) AS $$
    SELECT ght.id
         , ght.name
         , ght.slug
         , tr.name
         , tr.full_name
         , tr.role_name
         , tr.archived
         , gtt.team_name
         , gtt.team_contact_email
    FROM github_team_repositories tr
             JOIN github_teams ght ON tr.team_id = ght.id
             LEFT JOIN galaxies_teams_table gtt ON ght.slug = gtt.team_primary_github_team
    WHERE tr.role_name = 'admin';
$$ LANGUAGE SQL;

CREATE VIEW view_repo_ownership AS SELECT * FROM fn_repo_ownership();

-- Running EC2 Instances

CREATE OR REPLACE FUNCTION fn_running_ec2_instances() RETURNS TABLE(account_name TEXT, app TEXT, stack TEXT, stage TEXT, image_id TEXT, instance_id TEXT, built_by_amigo BOOL, launch_time TIMESTAMP, type TEXT) AS $$
    WITH id_and_tags AS (SELECT image_id, tags ->> 'BuiltBy' AS built_by
                        FROM aws_ec2_images
                        WHERE tags IS NOT NULL
                        ORDER BY image_id),

        aggregated_images AS (SELECT image_id,
                                    CASE
                                        WHEN 'amigo' = ANY (array_agg(built_by)) THEN TRUE
                                        ELSE FALSE
                                        END AS built_by_amigo
                            FROM id_and_tags
                            GROUP BY image_id, built_by
                            ORDER BY image_id)

    SELECT DISTINCT ON (instances.instance_id) accts.name               AS account_name,
                                            instances.tags ->> 'App' AS app,
                                            instances.tags ->> 'Stack' AS stack,
                                            instances.tags ->> 'Stage' AS stage,
                                            instances.image_id,
                                            instances.instance_id,
                                            CASE
                                                WHEN images.built_by_amigo THEN TRUE
                                                ELSE FALSE
                                                END                  AS built_by_amigo,
                                            instances.launch_time,
                                            instances.instance_type AS type
    FROM aws_ec2_instances instances
            LEFT JOIN aggregated_images images
                    ON instances.image_id = images.image_id -- instances.account_id=images.account_id
            LEFT JOIN aws_organizations_accounts accts ON instances.account_id = accts.id
    WHERE instances.state ->> 'Name' = 'running'
    ORDER BY instances.instance_id, built_by_amigo DESC;
$$ LANGUAGE SQL;

CREATE OR REPLACE VIEW view_running_instances AS SELECT * FROM fn_running_ec2_instances();

-- AWS Accounts

CREATE OR REPLACE FUNCTION fn_aws_accounts()
RETURNS TABLE (
    id TEXT,
    name TEXT,
    email TEXT,
    status TEXT,
    joined_timestamp TIMESTAMP,
    organizational_unit TEXT
)
AS $$
    SELECT DISTINCT acc.id,
                    acc.name,
                    acc.email,
                    acc.status,
                    acc.joined_timestamp,
                    COALESCE(ou.name, 'ROOT') AS organizational_unit
    FROM aws_organizations_accounts acc
    LEFT JOIN aws_organizations_account_parents par ON acc.id = par.id
    LEFT JOIN aws_organizations_organizational_units ou ON par.parent_id = ou.id;
$$ LANGUAGE SQL;

CREATE OR REPLACE VIEW aws_accounts AS SELECT * FROM fn_aws_accounts();

-- Outdated EC2 Instances

CREATE OR REPLACE FUNCTION fn_old_ec2_instances() RETURNS TABLE(account_id TEXT, account_name TEXT, instance_id TEXT, state TEXT, stack TEXT, stage TEXT, app TEXT, repo TEXT, region TEXT, creation_or_launch_time DATE) AS $$
    SELECT ac.id AS account_id,
           ac.name AS account_name,
           ec2.instance_id,
           ec2.state ->> 'Name' AS state,
           ec2.tags ->> 'Stack' AS stack,
           ec2.tags ->> 'Stage' AS stage,
           ec2.tags ->> 'App' AS app,
           ec2.tags ->> 'gu:repo' AS repo,
           ec2.region,
           COALESCE(img.creation_date, ec2.launch_time) AS creation_or_launch_time
    FROM aws_ec2_instances ec2
    LEFT JOIN aws_ec2_images img ON ec2.image_id = img.image_id
    LEFT JOIN fn_aws_accounts() ac ON ec2.account_id = ac.id
    WHERE (COALESCE(img.creation_date, ec2.launch_time) IS NULL
           OR COALESCE(img.creation_date, ec2.launch_time) < NOW() - INTERVAL '30 days')
      AND ec2.state ->> 'Name' = 'running';
$$ LANGUAGE SQL;

CREATE OR REPLACE VIEW view_old_ec2_instances AS SELECT * FROM fn_old_ec2_instances();

-- Github Actions

CREATE OR REPLACE FUNCTION fn_github_actions()
RETURNS TABLE (
    evaluated_on TIMESTAMP,
    full_name TEXT,
    archived BOOL,
    workflow_path TEXT,
    action TEXT,
    action_name TEXT,
    version TEXT
)
AS $$
    WITH data AS (
        SELECT  tbl.evaluated_on
                , tbl.full_name
                , tbl.workflow_path
                , use_string AS action
                , split_part(use_string, '@', 1) AS action_name -- after splitting, take the first item
                , split_part(use_string, '@', -1) AS version -- after splitting, take the last item
        FROM    guardian_github_actions_usage tbl
                , unnest(tbl.workflow_uses) AS use_string -- expand the string array into rows, e.g. an array of 2 items becomes 2 rows
    )
    SELECT  d.evaluated_on
            , d.full_name
            , r.archived
            , d.workflow_path
            , d.action
            , d.action_name
            , d.version
    FROM    data d
            JOIN github_repositories r ON d.full_name = r.full_name;
$$ LANGUAGE SQL;

CREATE OR REPLACE VIEW view_github_actions AS SELECT * FROM fn_github_actions();