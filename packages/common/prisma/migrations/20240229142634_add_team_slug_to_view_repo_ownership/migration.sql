create or replace view view_repo_ownership as
select ght.id        as "github_team_id"
     , ght.name      as "github_team_name"
     , tr.full_name  as "repo_name" --deprecated. use full_name below for consistency with other tables
     , tr.full_name  as "full_name"
     , tr.role_name
     , tr.archived
     , gtt.team_name as "galaxies_team"
     , gtt.team_contact_email
     , ght.slug      as "github_team_slug"
     , tr.name       as "name"
from github_team_repositories tr
         join github_teams ght on tr.team_id = ght.id
         left join galaxies_teams_table gtt on ght.slug = gtt.team_primary_github_team
where tr.role_name = 'admin';