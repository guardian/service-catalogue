SELECT
  ght.id AS github_team_id,
  ght.name AS github_team_name,
  tr.full_name AS repo_name,
  tr.full_name,
  tr.role_name,
  tr.archived,
  gtt.team_name AS galaxies_team,
  gtt.team_contact_email
FROM
  (
    (
      github_team_repositories tr
      JOIN github_teams ght ON ((tr.team_id = ght.id))
    )
    LEFT JOIN galaxies_teams_table gtt ON ((ght.slug = gtt.team_primary_github_team))
  )
WHERE
  (tr.role_name = 'admin' :: text);