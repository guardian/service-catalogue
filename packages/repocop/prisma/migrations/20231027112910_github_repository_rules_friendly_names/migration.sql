-- AlterTable
ALTER TABLE "repocop_github_repository_rules" RENAME COLUMN  "repository_01" TO "default_branch_name";
ALTER TABLE "repocop_github_repository_rules" RENAME COLUMN  "repository_02" TO "branch_protection";
ALTER TABLE "repocop_github_repository_rules" RENAME COLUMN  "repository_03" TO "team_based_access";
ALTER TABLE "repocop_github_repository_rules" RENAME COLUMN  "repository_04" TO "admin_access";
ALTER TABLE "repocop_github_repository_rules" RENAME COLUMN  "repository_05" TO "archiving";
ALTER TABLE "repocop_github_repository_rules" RENAME COLUMN  "repository_06" TO "topics";
ALTER TABLE "repocop_github_repository_rules" RENAME COLUMN  "repository_07" TO "contents";