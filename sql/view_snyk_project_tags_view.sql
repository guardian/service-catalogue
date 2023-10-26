/*
 The view view_snyk_project_tags destructures snyk_projects on the tags field, creating a layout that is easier to query.

 It's shape is:
   id | org_id | name | repo | commit

 see prisma migration 20231026185557_snyk_project_tags
 in directory packages/repocop/prisma/migrations
 */

-- create or replace view view_snyk_project_tags as
--     --| project1 | key:commit, value:somecommithash |
-- --| project1 | key:repo, value:guardian/somerepo |
-- with all_tags as (select id, jsonb_array_elements(tags) as tags
--                   from snyk_projects),
--
--      -- | project-1 | somecommithash |
--      projects_with_hashes as (select id, tags ->> 'value' as commit
--                               from all_tags
--                               where tags ->> 'key' = 'commit'),
--
-- -- | project-1 | guardian/somerepo |
--      projects_with_repos as (select id, tags ->> 'value' as repo
--                              from all_tags
--                              where tags ->> 'key' = 'repo')
--
-- select p.id,
--        p.org_id,
--        p.name,
--        r.repo,
--        h.commit
-- from snyk_projects p
--          left join projects_with_hashes h on p.id = h.id
--          left join projects_with_repos r on p.id = r.id
-- order by h.commit;
