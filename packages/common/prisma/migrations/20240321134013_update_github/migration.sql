-- AlterTable
ALTER TABLE "github_repositories" ADD COLUMN     "custom_properties" JSONB,
ADD COLUMN     "web_commit_signoff_required" BOOLEAN;

-- AlterTable
ALTER TABLE "github_team_repositories" ADD COLUMN     "custom_properties" JSONB,
ADD COLUMN     "web_commit_signoff_required" BOOLEAN;

-- AlterTable
ALTER TABLE "github_workflows" ADD COLUMN     "contents_as_json" JSONB;
