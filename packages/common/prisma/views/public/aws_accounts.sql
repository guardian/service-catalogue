SELECT
  fn_aws_accounts.id,
  fn_aws_accounts.name,
  fn_aws_accounts.email,
  fn_aws_accounts.status,
  fn_aws_accounts.joined_timestamp,
  fn_aws_accounts.ancestors,
  fn_aws_accounts.is_product_and_engineering
FROM
  fn_aws_accounts() fn_aws_accounts(
    id,
    name,
    email,
    STATUS,
    joined_timestamp,
    ancestors,
    is_product_and_engineering
  );