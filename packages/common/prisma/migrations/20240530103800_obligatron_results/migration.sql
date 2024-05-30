CREATE TABLE IF NOT EXISTS obligatron_results (
    "date" TIMESTAMP NOT NULL,
    "obligation_name" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "contacts" JSONB NOT NULL,
    "url" TEXT NOT NULL
);