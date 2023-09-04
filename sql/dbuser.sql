CREATE USER repocop WITH LOGIN;
GRANT USAGE ON SCHEMA public to repocop;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO repocop;
GRANT rds_iam TO repocop;