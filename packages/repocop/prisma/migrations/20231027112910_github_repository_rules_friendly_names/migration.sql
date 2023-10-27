/*
  Warnings:

  - You are about to drop the column `repository_01` on the `repocop_github_repository_rules` table. All the data in the column will be lost.
  - You are about to drop the column `repository_02` on the `repocop_github_repository_rules` table. All the data in the column will be lost.
  - You are about to drop the column `repository_03` on the `repocop_github_repository_rules` table. All the data in the column will be lost.
  - You are about to drop the column `repository_04` on the `repocop_github_repository_rules` table. All the data in the column will be lost.
  - You are about to drop the column `repository_05` on the `repocop_github_repository_rules` table. All the data in the column will be lost.
  - You are about to drop the column `repository_06` on the `repocop_github_repository_rules` table. All the data in the column will be lost.
  - You are about to drop the column `repository_07` on the `repocop_github_repository_rules` table. All the data in the column will be lost.
  - Added the required column `admin_access` to the `repocop_github_repository_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branch_protection` to the `repocop_github_repository_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `default_branch_name` to the `repocop_github_repository_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_based_access` to the `repocop_github_repository_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topics` to the `repocop_github_repository_rules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "repocop_github_repository_rules" DROP COLUMN "repository_01",
DROP COLUMN "repository_02",
DROP COLUMN "repository_03",
DROP COLUMN "repository_04",
DROP COLUMN "repository_05",
DROP COLUMN "repository_06",
DROP COLUMN "repository_07",
ADD COLUMN     "admin_access" BOOLEAN NOT NULL,
ADD COLUMN     "archiving" BOOLEAN,
ADD COLUMN     "branch_protection" BOOLEAN NOT NULL,
ADD COLUMN     "contents" BOOLEAN,
ADD COLUMN     "default_branch_name" BOOLEAN NOT NULL,
ADD COLUMN     "team_based_access" BOOLEAN NOT NULL,
ADD COLUMN     "topics" BOOLEAN NOT NULL;

