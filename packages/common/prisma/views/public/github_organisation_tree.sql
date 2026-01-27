SELECT
  fn_github_organisation_tree.id,
  fn_github_organisation_tree.type,
  fn_github_organisation_tree.name,
  fn_github_organisation_tree.ancestors,
  fn_github_organisation_tree.is_product_and_engineering
FROM
  fn_github_organisation_tree() fn_github_organisation_tree(
    id,
    TYPE,
    name,
    ancestors,
    is_product_and_engineering
  );