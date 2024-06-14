/*
 sql should not be applied directly to the db, use prisma migrations
*/
CREATE USER dataaudit WITH LOGIN;
GRANT USAGE ON SCHEMA public to dataaudit;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO dataaudit;
GRANT rds_iam TO dataaudit;

-- This table is created via a Prisma migration
GRANT ALL ON public.audit_results TO dataaudit;

CREATE USER github_actions_usage WITH LOGIN;
GRANT USAGE ON SCHEMA public to github_actions_usage;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO github_actions_usage;
GRANT rds_iam TO github_actions_usage;

-- This table is created via a Prisma migration
GRANT ALL ON public.guardian_github_actions_usage TO github_actions_usage;
