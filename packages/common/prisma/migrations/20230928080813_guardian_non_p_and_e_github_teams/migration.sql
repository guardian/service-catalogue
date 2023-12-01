DROP TABLE IF EXISTS guardian_non_p_and_e_github_teams;

/*
 A lot of best practice recommendations and expectations only apply to repos
 that are owned by P&E or are otherwise uncategorised. This is a list of github
 team slugs for teams that sit outside of the P&E department for easy exclusion
 of these teams in queries.
 */
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
