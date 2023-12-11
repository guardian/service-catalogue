/*
 sql should not be applied directly to the db, use prisma migrations
*/
CREATE USER repocop WITH LOGIN;
GRANT USAGE ON SCHEMA public to repocop;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO repocop;
GRANT rds_iam TO repocop;

-- This table is created via a Prisma migration
GRANT ALL ON public.repocop_github_repository_rules TO repocop;

CREATE USER dataaudit WITH LOGIN;
GRANT USAGE ON SCHEMA public to dataaudit;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO dataaudit;
GRANT rds_iam TO dataaudit;

-- This table is created via a Prisma migration
GRANT ALL ON public.audit_results TO dataaudit;
