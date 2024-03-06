-- CreateTable
CREATE TABLE "repocop_vulnerabilities" (
    "source" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "open" BOOLEAN NOT NULL,
    "severity" TEXT NOT NULL,
    "package" TEXT NOT NULL,
    "urls" TEXT[],
    "ecosystem" TEXT NOT NULL,
    "alert_issue_date" TIMESTAMP(3) NOT NULL,
    "is_patchable" BOOLEAN NOT NULL,
    "cves" TEXT[],
    "repo_owner" TEXT NOT NULL,

    CONSTRAINT "repocop_vulnerabilities_pkey" PRIMARY KEY ("full_name","alert_issue_date","repo_owner")
);
