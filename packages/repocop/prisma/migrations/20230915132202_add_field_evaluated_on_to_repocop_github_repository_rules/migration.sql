/*
  Warnings:

  - Added the required column `evaluated_on` to the `repocop_github_repository_rules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "repocop_github_repository_rules" ADD COLUMN     "evaluated_on" TIMESTAMP(3) NOT NULL;
