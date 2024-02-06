DROP TABLE IF EXISTS repocop_github_repository_rules;

-- CreateTable
CREATE TABLE "repocop_github_repository_rules" (
    "full_name" TEXT NOT NULL,
    "default_branch_name" BOOLEAN NOT NULL,
    "branch_protection" BOOLEAN NOT NULL,
    "team_based_access" BOOLEAN NOT NULL,
    "admin_access" BOOLEAN NOT NULL,
    "archiving" BOOLEAN,
    "topics" BOOLEAN NOT NULL,
    "contents" BOOLEAN,
    "vulnerability_tracking" BOOLEAN NOT NULL,
    "evaluated_on" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "repocop_github_repository_rules_full_name_key" ON "repocop_github_repository_rules"("full_name");
