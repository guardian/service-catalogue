WITH data AS (
  SELECT
    tbl.evaluated_on,
    tbl.full_name,
    tbl.workflow_path,
    use_string.use_string AS ACTION,
    split_part(use_string.use_string, '@' :: text, 1) AS action_name,
    split_part(use_string.use_string, '@' :: text, '-1' :: integer) AS version
  FROM
    guardian_github_actions_usage tbl,
    LATERAL unnest(tbl.workflow_uses) use_string(use_string)
)
SELECT
  d.evaluated_on,
  d.full_name,
  r.archived,
  d.workflow_path,
  d.action,
  d.action_name,
  d.version
FROM
  (
    data d
    JOIN github_repositories r ON ((d.full_name = r.full_name))
  );