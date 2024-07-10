SELECT
  fn_aws_organizations_tree.id,
  fn_aws_organizations_tree.type,
  fn_aws_organizations_tree.name,
  fn_aws_organizations_tree.ancestors,
  fn_aws_organizations_tree.is_product_and_engineering
FROM
  fn_aws_organizations_tree() fn_aws_organizations_tree(
    id,
    TYPE,
    name,
    ancestors,
    is_product_and_engineering
  );