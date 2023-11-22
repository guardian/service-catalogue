/*
  Warnings:

  - Added the required column `evaluated_on` to the `repocop_github_repository_rules` table without a default value. This is not possible if the table is not empty.

*/
-- DeleteEntries which can be easily generated by running the lambda (if not run manually it eventually be repopulated automatically)
DELETE FROM repocop_github_repository_rules;
-- AlterTable
ALTER TABLE "repocop_github_repository_rules" ADD COLUMN     "evaluated_on" TIMESTAMP(3) NOT NULL;