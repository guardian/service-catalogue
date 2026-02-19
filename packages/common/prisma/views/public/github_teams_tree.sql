SELECT
  fn_github_teams_tree.id,
  fn_github_teams_tree.org,
  fn_github_teams_tree.slug,
  fn_github_teams_tree.name,
  fn_github_teams_tree.ancestors,
  fn_github_teams_tree.is_product_and_engineering
FROM
  fn_github_teams_tree() fn_github_teams_tree(
    id,
    org,
    slug,
    name,
    ancestors,
    is_product_and_engineering
  );