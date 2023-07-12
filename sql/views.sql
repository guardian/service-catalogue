create or replace view view_repo_ownership as
select ght.id as "github_team_id"
     , ght.name as "github_team_name"
     , tr.full_name as "repo_name"
     , tr.role_name
     , tr.archived
     , gtt.team_name as "galaxies_team"
     , gtt.team_contact_email
from   github_team_repositories tr
           join github_teams ght on tr.team_id = ght.id
           left join galaxies_teams_table gtt on ght.slug = gtt.team_primary_github_team
where tr.role_name = 'admin' and tr.archived = false;

CREATE OR REPLACE FUNCTION coalesce_dates(image_creation_time text, instance_launch_time timestamp) RETURNS date
    LANGUAGE SQL
    IMMUTABLE
RETURN coalesce(cast(image_creation_time as date), cast(instance_launch_time as date));

create or replace view view_old_ec2_instances as
select  ac.id as account_id
     , ac.name as account_name
     , ec2.instance_id
     , ec2.state ->> 'Name' as state
     , ec2.tags ->> 'Stack' as stack
     , ec2.tags ->> 'Stage' as stage
     , ec2.tags ->> 'App' as app
     , ec2.tags ->> 'gu:repo' as repo
     , ec2.region
     , coalesce_dates(img.creation_date, ec2.launch_time) as creation_or_launch_time
from aws_ec2_instances ec2
         left join aws_ec2_images img on ec2.image_id = img.image_id
         left join aws_accounts ac on ec2.account_id = ac.id
where (
        coalesce_dates(img.creation_date, ec2.launch_time) is null
        or coalesce_dates(img.creation_date, ec2.launch_time) < NOW() - INTERVAL '30 days'
    )
  and ec2.state ->> 'Name' = 'running';

-- General information about running EC2 instances
-- | account_name |  app |  image_id  | instance_id | built_by_amigo | launch_time|
-- |--------------|------|------------|-------------|----------------|------------|
-- |    account1  | grid | ami-123456 |  i-1234556  |      true      | 2023-06-23 |
create or replace view view_running_instances as
with id_and_tags as (select image_id, tags ->> 'BuiltBy' as built_by from aws_ec2_images where tags is not null order by image_id),

aggregated_images as (select image_id,
       CASE
           WHEN 'amigo' = ANY(array_agg(built_by)) THEN true
           ELSE false
           END as built_by_amigo
from id_and_tags group by image_id, built_by order by image_id)

select distinct on (instances.instance_id)
    accts.name as account_name,
    instances.tags ->> 'App' as app,

    instances.image_id,
    instances.instance_id,
    CASE
        WHEN images.built_by_amigo THEN true
        ELSE false
        END as built_by_amigo,
    cast(instances.launch_time as date)
from
    aws_ec2_instances instances
        left join aggregated_images images on instances.image_id = images.image_id -- instances.account_id=images.account_id
        left join aws_organizations_accounts accts on instances.account_id = accts.id
where
            instances.state ->> 'Name' = 'running'
order by instances.instance_id, built_by_amigo desc;

/*
 This view destructures snyk_projects on the tags field, creating a layout that is easier to query.

 It's shape is:
   id | org_id | name | repo | commit
 */
CREATE OR REPLACE VIEW view_snyk_project_tags AS
WITH
    expanded_tags AS (
        SELECT  *
             , jsonb_array_elements(tags) ->> 'value' AS tag
        FROM snyk_projects
    )
   , project_tags as (
    SELECT  id
         , org_id
         , name
         , CASE WHEN tag LIKE 'guardian/%' THEN tag END AS repo
         , CASE WHEN tag NOT LIKE 'guardian/%' THEN tag END AS commit
    FROM expanded_tags
)
SELECT      id
     , org_id
     , name
     , max(repo) AS repo
     , max(commit) AS commit
FROM        project_tags
GROUP BY    id
       , org_id
       , name;
