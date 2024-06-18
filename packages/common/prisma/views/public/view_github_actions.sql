SELECT
  fn_github_actions.evaluated_on,
  fn_github_actions.full_name,
  fn_github_actions.archived,
  fn_github_actions.workflow_path,
  fn_github_actions.action,
  fn_github_actions.action_name,
  fn_github_actions.version
FROM
  fn_github_actions() fn_github_actions(
    evaluated_on,
    full_name,
    archived,
    workflow_path,
    ACTION,
    action_name,
    version
  );