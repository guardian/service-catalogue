WITH all_tags AS (
  SELECT
    snyk_projects.id,
    jsonb_array_elements(snyk_projects.tags) AS tags
  FROM
    snyk_projects
),
projects_with_hashes AS (
  SELECT
    all_tags.id,
    (all_tags.tags ->> 'value' :: text) AS COMMIT
  FROM
    all_tags
  WHERE
    ((all_tags.tags ->> 'key' :: text) = 'commit' :: text)
),
projects_with_repos AS (
  SELECT
    all_tags.id,
    (all_tags.tags ->> 'value' :: text) AS repo
  FROM
    all_tags
  WHERE
    ((all_tags.tags ->> 'key' :: text) = 'repo' :: text)
)
SELECT
  p.id,
  p.org_id,
  p.name,
  r.repo,
  h.commit
FROM
  (
    (
      snyk_projects p
      LEFT JOIN projects_with_hashes h ON ((p.id = h.id))
    )
    LEFT JOIN projects_with_repos r ON ((p.id = r.id))
  )
ORDER BY
  h.commit;