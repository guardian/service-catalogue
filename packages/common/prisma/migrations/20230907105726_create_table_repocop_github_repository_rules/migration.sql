DROP TABLE IF EXISTS repocop_github_repository_rules;

-- CreateTable
CREATE TABLE "repocop_github_repository_rules" (
    "full_name" TEXT NOT NULL,
    "repository_01" BOOLEAN NOT NULL,
    "repository_02" BOOLEAN NOT NULL,
    "repository_03" BOOLEAN NOT NULL,
    "repository_04" BOOLEAN NOT NULL,
    "repository_05" BOOLEAN NOT NULL,
    "repository_06" BOOLEAN NOT NULL,
    "repository_07" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "repocop_github_repository_rules_full_name_key" ON "repocop_github_repository_rules"("full_name");
