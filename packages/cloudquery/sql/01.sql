-- Create user for CloudQuery, and grant RDS IAM authentication.
-- See https://repost.aws/knowledge-center/rds-postgresql-connect-using-iam
CREATE USER cloudquery;
GRANT rds_iam TO cloudquery;
