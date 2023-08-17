-- The Guardian has six recognised production statuses for repositories.
-- Here they are enumerated and prioritised
drop table if exists guardian_production_status;

create table guardian_production_status
(
    status   text PRIMARY KEY,
    priority integer NOT NULL
);

insert into guardian_production_status (status, priority)
values ('production', 0),
       ('testing', 1),
       ('documentation', 2), --no code, but still needs to be up to date
       ('prototype', 3),
       ('hackday', 4),
       ('learning', 5)
on conflict (status) do nothing;

/*
 A lot of best practice recommendations and expectations only apply to repos
 that are owned by P&E or are otherwise uncategorised. This is a list of github
 team slugs for teams that sit outside of the P&E department for easy exclusion
 of these teams in queries.
 */
drop table if exists guardian_non_p_and_e_github_teams;

create table guardian_non_p_and_e_github_teams
(
    team_name text PRIMARY KEY
);
insert into guardian_non_p_and_e_github_teams (team_name)
values ('data-and-insight'),
       ('data-design'),
       ('data-science'),
       ('d-i-data-science'),
       ('enterprise-infrastructure'),
       ('esd'),
       ('esd-admin'),
       ('guardian-design-team'),
       ('guardian-us-design-team'),
       ('glabs-au'),
       ('it-australia'),
       ('infosec'),
       ('infosec-admin'),
       ('interactive-team'),
       ('interactives-owner-placeholder'),
       ('interactives-admin'),
       ('multimedia')
on conflict (team_name) do nothing;

create or replace view view_repo_ownership as
select ght.id        as "github_team_id"
     , ght.name      as "github_team_name"
     , tr.full_name  as "repo_name" --deprecated. use full_name below for consistency with other tables
     , tr.full_name  as "full_name"
     , tr.role_name
     , tr.archived
     , gtt.team_name as "galaxies_team"
     , gtt.team_contact_email
from github_team_repositories tr
         join github_teams ght on tr.team_id = ght.id
         left join galaxies_teams_table gtt on ght.slug = gtt.team_primary_github_team
where tr.role_name = 'admin';


CREATE OR REPLACE FUNCTION coalesce_dates(image_creation_time text, instance_launch_time timestamp) RETURNS date
    LANGUAGE SQL
    IMMUTABLE
RETURN coalesce(cast(image_creation_time as date), cast(instance_launch_time as date));

create or replace view view_old_ec2_instances as
select ac.id                                              as account_id
     , ac.name                                            as account_name
     , ec2.instance_id
     , ec2.state ->> 'Name'                               as state
     , ec2.tags ->> 'Stack'                               as stack
     , ec2.tags ->> 'Stage'                               as stage
     , ec2.tags ->> 'App'                                 as app
     , ec2.tags ->> 'gu:repo'                             as repo
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

/*
General information about running EC2 instances
| account_name |  app |  image_id  | instance_id | built_by_amigo | launch_time|
|--------------|------|------------|-------------|----------------|------------|
|    account1  | grid | ami-123456 |  i-1234556  |      true      | 2023-06-23 |
 */
create or replace view view_running_instances as
with id_and_tags as (select image_id, tags ->> 'BuiltBy' as built_by
                     from aws_ec2_images
                     where tags is not null
                     order by image_id),

     aggregated_images as (select image_id,
                                  CASE
                                      WHEN 'amigo' = ANY (array_agg(built_by)) THEN true
                                      ELSE false
                                      END as built_by_amigo
                           from id_and_tags
                           group by image_id, built_by
                           order by image_id)

select distinct on (instances.instance_id) accts.name               as account_name,
                                           instances.tags ->> 'App' as app,

                                           instances.image_id,
                                           instances.instance_id,
                                           CASE
                                               WHEN images.built_by_amigo THEN true
                                               ELSE false
                                               END                  as built_by_amigo,
                                           cast(instances.launch_time as date)
from aws_ec2_instances instances
         left join aggregated_images images
                   on instances.image_id = images.image_id -- instances.account_id=images.account_id
         left join aws_organizations_accounts accts on instances.account_id = accts.id
where instances.state ->> 'Name' = 'running'
order by instances.instance_id, built_by_amigo desc;

/*
 This view destructures snyk_projects on the tags field, creating a layout that is easier to query.

 It's shape is:
   id | org_id | name | repo | commit
 */

create or replace view view_snyk_project_tags as
    --| project1 | key:commit, value:somecommithash |
--| project1 | key:repo, value:guardian/somerepo |
with all_tags as (select id, jsonb_array_elements(tags) as tags
                  from snyk_projects),

     -- | project-1 | somecommithash |
     projects_with_hashes as (select id, tags ->> 'value' as commit
                              from all_tags
                              where tags ->> 'key' = 'commit'),

-- | project-1 | guardian/somerepo |
     projects_with_repos as (select id, tags ->> 'value' as repo
                             from all_tags
                             where tags ->> 'key' = 'repo')

select p.id,
       p.org_id,
       p.name,
       r.repo,
       h.commit
from snyk_projects p
         left join projects_with_hashes h on p.id = h.id
         left join projects_with_repos r on p.id = r.id
order by h.commit;
