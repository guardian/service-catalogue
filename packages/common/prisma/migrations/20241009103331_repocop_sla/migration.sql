/*
  Warnings:

  - Added the required column `within_sla` to the `repocop_vulnerabilities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "repocop_vulnerabilities" ADD COLUMN     "within_sla" BOOLEAN NOT NULL;
