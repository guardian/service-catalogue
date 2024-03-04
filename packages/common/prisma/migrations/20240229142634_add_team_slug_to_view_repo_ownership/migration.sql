drop view if exists view_repo_ownership;

create view view_repo_ownership as
select ght.id        as "github_team_id"
     , ght.name      as "github_team_name"
     , ght.slug      as "github_team_slug"
     , tr.name       as "short_repo_name"
     , tr.full_name  as "full_repo_name"
     , tr.role_name
     , tr.archived
     , gtt.team_name as "galaxies_team"
     , gtt.team_contact_email
from github_team_repositories tr
         join github_teams ght on tr.team_id = ght.id
         left join galaxies_teams_table gtt on ght.slug = gtt.team_primary_github_team
where tr.role_name = 'admin';