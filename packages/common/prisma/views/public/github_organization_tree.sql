SELECT
  fn_github_organization_tree.id,
  fn_github_organization_tree.type,
  fn_github_organization_tree.name,
  fn_github_organization_tree.ancestors,
  fn_github_organization_tree.is_product_and_engineering
FROM
  fn_github_organization_tree() fn_github_organization_tree(
    id,
    TYPE,
    name,
    ancestors,
    is_product_and_engineering
  );