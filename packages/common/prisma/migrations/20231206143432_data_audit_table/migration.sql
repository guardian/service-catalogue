DROP TABLE IF EXISTS audit_results;

CREATE TABLE audit_results (
    "evaluated_on" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL PRIMARY KEY,
    "success" BOOLEAN NOT NULL,
    "cloudquery" INTEGER NOT NULL,
    "vendor" INTEGER NOT NULL
);
