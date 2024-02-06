-- CreateTable
CREATE TABLE "aws_cloudformation_stacks" (
                                             "_cq_sync_time" TIMESTAMP(6),
                                             "_cq_source_name" TEXT,
                                             "_cq_id" UUID NOT NULL,
                                             "_cq_parent_id" UUID,
                                             "account_id" TEXT,
                                             "region" TEXT,
                                             "id" TEXT,
                                             "arn" TEXT NOT NULL,
                                             "tags" JSONB,
                                             "creation_time" TIMESTAMP(6),
                                             "stack_name" TEXT,
                                             "stack_status" TEXT,
                                             "capabilities" TEXT[],
                                             "change_set_id" TEXT,
                                             "deletion_time" TIMESTAMP(6),
                                             "description" TEXT,
                                             "disable_rollback" BOOLEAN,
                                             "drift_information" JSONB,
                                             "enable_termination_protection" BOOLEAN,
                                             "last_updated_time" TIMESTAMP(6),
                                             "notification_arns" TEXT[],
                                             "outputs" JSONB,
                                             "parameters" JSONB,
                                             "parent_id" TEXT,
                                             "retain_except_on_create" BOOLEAN,
                                             "role_arn" TEXT,
                                             "rollback_configuration" JSONB,
                                             "root_id" TEXT,
                                             "stack_id" TEXT,
                                             "stack_status_reason" TEXT,
                                             "timeout_in_minutes" BIGINT,

                                             CONSTRAINT "aws_cloudformation_stacks_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "github_repositories" (
                                       "_cq_sync_time" TIMESTAMP(6),
                                       "_cq_source_name" TEXT,
                                       "_cq_id" UUID NOT NULL,
                                       "_cq_parent_id" UUID,
                                       "org" TEXT NOT NULL,
                                       "id" BIGINT NOT NULL,
                                       "node_id" TEXT,
                                       "owner" JSONB,
                                       "name" TEXT,
                                       "full_name" TEXT,
                                       "description" TEXT,
                                       "homepage" TEXT,
                                       "code_of_conduct" JSONB,
                                       "default_branch" TEXT,
                                       "master_branch" TEXT,
                                       "created_at" TIMESTAMP(6),
                                       "pushed_at" TIMESTAMP(6),
                                       "updated_at" TIMESTAMP(6),
                                       "html_url" TEXT,
                                       "clone_url" TEXT,
                                       "git_url" TEXT,
                                       "mirror_url" TEXT,
                                       "ssh_url" TEXT,
                                       "svn_url" TEXT,
                                       "language" TEXT,
                                       "fork" BOOLEAN,
                                       "forks_count" BIGINT,
                                       "network_count" BIGINT,
                                       "open_issues_count" BIGINT,
                                       "open_issues" BIGINT,
                                       "stargazers_count" BIGINT,
                                       "subscribers_count" BIGINT,
                                       "watchers_count" BIGINT,
                                       "watchers" BIGINT,
                                       "size" BIGINT,
                                       "auto_init" BOOLEAN,
                                       "parent" JSONB,
                                       "source" JSONB,
                                       "template_repository" JSONB,
                                       "organization" JSONB,
                                       "permissions" JSONB,
                                       "allow_rebase_merge" BOOLEAN,
                                       "allow_update_branch" BOOLEAN,
                                       "allow_squash_merge" BOOLEAN,
                                       "allow_merge_commit" BOOLEAN,
                                       "allow_auto_merge" BOOLEAN,
                                       "allow_forking" BOOLEAN,
                                       "delete_branch_on_merge" BOOLEAN,
                                       "use_squash_pr_title_as_default" BOOLEAN,
                                       "squash_merge_commit_title" TEXT,
                                       "squash_merge_commit_message" TEXT,
                                       "merge_commit_title" TEXT,
                                       "merge_commit_message" TEXT,
                                       "topics" TEXT[],
                                       "archived" BOOLEAN,
                                       "disabled" BOOLEAN,
                                       "license" JSONB,
                                       "private" BOOLEAN,
                                       "has_issues" BOOLEAN,
                                       "has_wiki" BOOLEAN,
                                       "has_pages" BOOLEAN,
                                       "has_projects" BOOLEAN,
                                       "has_downloads" BOOLEAN,
                                       "has_discussions" BOOLEAN,
                                       "is_template" BOOLEAN,
                                       "license_template" TEXT,
                                       "gitignore_template" TEXT,
                                       "security_and_analysis" JSONB,
                                       "team_id" BIGINT,
                                       "url" TEXT,
                                       "archive_url" TEXT,
                                       "assignees_url" TEXT,
                                       "blobs_url" TEXT,
                                       "branches_url" TEXT,
                                       "collaborators_url" TEXT,
                                       "comments_url" TEXT,
                                       "commits_url" TEXT,
                                       "compare_url" TEXT,
                                       "contents_url" TEXT,
                                       "contributors_url" TEXT,
                                       "deployments_url" TEXT,
                                       "downloads_url" TEXT,
                                       "events_url" TEXT,
                                       "forks_url" TEXT,
                                       "git_commits_url" TEXT,
                                       "git_refs_url" TEXT,
                                       "git_tags_url" TEXT,
                                       "hooks_url" TEXT,
                                       "issue_comment_url" TEXT,
                                       "issue_events_url" TEXT,
                                       "issues_url" TEXT,
                                       "keys_url" TEXT,
                                       "labels_url" TEXT,
                                       "languages_url" TEXT,
                                       "merges_url" TEXT,
                                       "milestones_url" TEXT,
                                       "notifications_url" TEXT,
                                       "pulls_url" TEXT,
                                       "releases_url" TEXT,
                                       "stargazers_url" TEXT,
                                       "statuses_url" TEXT,
                                       "subscribers_url" TEXT,
                                       "subscription_url" TEXT,
                                       "tags_url" TEXT,
                                       "trees_url" TEXT,
                                       "teams_url" TEXT,
                                       "text_matches" JSONB,
                                       "visibility" TEXT,
                                       "role_name" TEXT,

                                       CONSTRAINT "github_repositories_cqpk" PRIMARY KEY ("org","id")
);

-- CreateTable
CREATE TABLE "github_repository_branches" (
                                              "_cq_sync_time" TIMESTAMP(6),
                                              "_cq_source_name" TEXT,
                                              "_cq_id" UUID NOT NULL,
                                              "_cq_parent_id" UUID,
                                              "org" TEXT NOT NULL,
                                              "repository_id" BIGINT NOT NULL,
                                              "protection" JSONB,
                                              "name" TEXT NOT NULL,
                                              "commit" JSONB,
                                              "protected" BOOLEAN,

                                              CONSTRAINT "github_repository_branches_cqpk" PRIMARY KEY ("org","repository_id","name")
);

-- CreateTable
CREATE TABLE "github_team_repositories" (
                                            "_cq_sync_time" TIMESTAMP(6),
                                            "_cq_source_name" TEXT,
                                            "_cq_id" UUID NOT NULL,
                                            "_cq_parent_id" UUID,
                                            "org" TEXT NOT NULL,
                                            "team_id" BIGINT NOT NULL,
                                            "id" BIGINT NOT NULL,
                                            "node_id" TEXT,
                                            "owner" JSONB,
                                            "name" TEXT,
                                            "full_name" TEXT,
                                            "description" TEXT,
                                            "homepage" TEXT,
                                            "code_of_conduct" JSONB,
                                            "default_branch" TEXT,
                                            "master_branch" TEXT,
                                            "created_at" TIMESTAMP(6),
                                            "pushed_at" TIMESTAMP(6),
                                            "updated_at" TIMESTAMP(6),
                                            "html_url" TEXT,
                                            "clone_url" TEXT,
                                            "git_url" TEXT,
                                            "mirror_url" TEXT,
                                            "ssh_url" TEXT,
                                            "svn_url" TEXT,
                                            "language" TEXT,
                                            "fork" BOOLEAN,
                                            "forks_count" BIGINT,
                                            "network_count" BIGINT,
                                            "open_issues_count" BIGINT,
                                            "open_issues" BIGINT,
                                            "stargazers_count" BIGINT,
                                            "subscribers_count" BIGINT,
                                            "watchers_count" BIGINT,
                                            "watchers" BIGINT,
                                            "size" BIGINT,
                                            "auto_init" BOOLEAN,
                                            "parent" JSONB,
                                            "source" JSONB,
                                            "template_repository" JSONB,
                                            "organization" JSONB,
                                            "permissions" JSONB,
                                            "allow_rebase_merge" BOOLEAN,
                                            "allow_update_branch" BOOLEAN,
                                            "allow_squash_merge" BOOLEAN,
                                            "allow_merge_commit" BOOLEAN,
                                            "allow_auto_merge" BOOLEAN,
                                            "allow_forking" BOOLEAN,
                                            "delete_branch_on_merge" BOOLEAN,
                                            "use_squash_pr_title_as_default" BOOLEAN,
                                            "squash_merge_commit_title" TEXT,
                                            "squash_merge_commit_message" TEXT,
                                            "merge_commit_title" TEXT,
                                            "merge_commit_message" TEXT,
                                            "topics" TEXT[],
                                            "archived" BOOLEAN,
                                            "disabled" BOOLEAN,
                                            "license" JSONB,
                                            "private" BOOLEAN,
                                            "has_issues" BOOLEAN,
                                            "has_wiki" BOOLEAN,
                                            "has_pages" BOOLEAN,
                                            "has_projects" BOOLEAN,
                                            "has_downloads" BOOLEAN,
                                            "has_discussions" BOOLEAN,
                                            "is_template" BOOLEAN,
                                            "license_template" TEXT,
                                            "gitignore_template" TEXT,
                                            "security_and_analysis" JSONB,
                                            "url" TEXT,
                                            "archive_url" TEXT,
                                            "assignees_url" TEXT,
                                            "blobs_url" TEXT,
                                            "branches_url" TEXT,
                                            "collaborators_url" TEXT,
                                            "comments_url" TEXT,
                                            "commits_url" TEXT,
                                            "compare_url" TEXT,
                                            "contents_url" TEXT,
                                            "contributors_url" TEXT,
                                            "deployments_url" TEXT,
                                            "downloads_url" TEXT,
                                            "events_url" TEXT,
                                            "forks_url" TEXT,
                                            "git_commits_url" TEXT,
                                            "git_refs_url" TEXT,
                                            "git_tags_url" TEXT,
                                            "hooks_url" TEXT,
                                            "issue_comment_url" TEXT,
                                            "issue_events_url" TEXT,
                                            "issues_url" TEXT,
                                            "keys_url" TEXT,
                                            "labels_url" TEXT,
                                            "languages_url" TEXT,
                                            "merges_url" TEXT,
                                            "milestones_url" TEXT,
                                            "notifications_url" TEXT,
                                            "pulls_url" TEXT,
                                            "releases_url" TEXT,
                                            "stargazers_url" TEXT,
                                            "statuses_url" TEXT,
                                            "subscribers_url" TEXT,
                                            "subscription_url" TEXT,
                                            "tags_url" TEXT,
                                            "trees_url" TEXT,
                                            "teams_url" TEXT,
                                            "text_matches" JSONB,
                                            "visibility" TEXT,
                                            "role_name" TEXT,

                                            CONSTRAINT "github_team_repositories_cqpk" PRIMARY KEY ("org","team_id","id")
);

-- CreateTable
CREATE TABLE "github_teams" (
                                "_cq_sync_time" TIMESTAMP(6),
                                "_cq_source_name" TEXT,
                                "_cq_id" UUID NOT NULL,
                                "_cq_parent_id" UUID,
                                "org" TEXT NOT NULL,
                                "id" BIGINT NOT NULL,
                                "node_id" TEXT,
                                "name" TEXT,
                                "description" TEXT,
                                "url" TEXT,
                                "slug" TEXT,
                                "permission" TEXT,
                                "permissions" JSONB,
                                "privacy" TEXT,
                                "members_count" BIGINT,
                                "repos_count" BIGINT,
                                "organization" JSONB,
                                "html_url" TEXT,
                                "members_url" TEXT,
                                "repositories_url" TEXT,
                                "parent" JSONB,
                                "ldap_dn" TEXT,

                                CONSTRAINT "github_teams_cqpk" PRIMARY KEY ("org","id")
);

-- CreateTable
CREATE TABLE "github_workflows" (
                                    "_cq_sync_time" TIMESTAMP(6),
                                    "_cq_source_name" TEXT,
                                    "_cq_id" UUID NOT NULL,
                                    "_cq_parent_id" UUID,
                                    "org" TEXT NOT NULL,
                                    "repository_id" BIGINT NOT NULL,
                                    "contents" TEXT,
                                    "id" BIGINT NOT NULL,
                                    "node_id" TEXT,
                                    "name" TEXT,
                                    "path" TEXT,
                                    "state" TEXT,
                                    "created_at" TIMESTAMP(6),
                                    "updated_at" TIMESTAMP(6),
                                    "url" TEXT,
                                    "html_url" TEXT,
                                    "badge_url" TEXT,

                                    CONSTRAINT "github_workflows_cqpk" PRIMARY KEY ("org","repository_id","id")
);

-- CreateTable
CREATE TABLE "snyk_projects" (
                                 "_cq_source_name" TEXT,
                                 "_cq_sync_time" TIMESTAMP(6),
                                 "_cq_id" UUID NOT NULL,
                                 "_cq_parent_id" UUID,
                                 "id" TEXT NOT NULL,
                                 "name" TEXT,
                                 "origin" TEXT,
                                 "issue_counts_by_severity" JSONB,
                                 "tags" JSONB,
                                 "org_id" TEXT,

                                 CONSTRAINT "snyk_projects_cqpk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galaxies_teams_table" (
                                        "_cq_source_name" TEXT,
                                        "_cq_sync_time" TIMESTAMP(6),
                                        "_cq_id" UUID NOT NULL,
                                        "_cq_parent_id" UUID,
                                        "team_id" TEXT,
                                        "team_name" TEXT,
                                        "team_description" TEXT,
                                        "team_contact_email" TEXT,
                                        "team_google_chat_space_key" TEXT,
                                        "team_primary_github_team" TEXT,

                                        CONSTRAINT "galaxies_teams_table_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "github_languages" (
                                    "_cq_sync_time" TIMESTAMP(6),
                                    "_cq_source_name" TEXT,
                                    "_cq_id" UUID NOT NULL,
                                    "_cq_parent_id" UUID,
                                    "full_name" TEXT,
                                    "name" TEXT,
                                    "languages" TEXT[],

                                    CONSTRAINT "github_languages_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE "aws_lambda_functions" (
                                        "_cq_sync_time" TIMESTAMP(6),
                                        "_cq_source_name" TEXT,
                                        "_cq_id" UUID NOT NULL,
                                        "_cq_parent_id" UUID,
                                        "account_id" TEXT,
                                        "region" TEXT,
                                        "arn" TEXT NOT NULL,
                                        "policy_revision_id" TEXT,
                                        "policy_document" JSONB,
                                        "code_signing_config" JSONB,
                                        "code_repository_type" TEXT,
                                        "update_runtime_on" TEXT,
                                        "runtime_version_arn" TEXT,
                                        "code" JSONB,
                                        "concurrency" JSONB,
                                        "configuration" JSONB,
                                        "tags" JSONB,

                                        CONSTRAINT "aws_lambda_functions_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_s3_buckets" (
                                  "_cq_sync_time" TIMESTAMP(6),
                                  "_cq_source_name" TEXT,
                                  "_cq_id" UUID NOT NULL,
                                  "_cq_parent_id" UUID,
                                  "account_id" TEXT,
                                  "arn" TEXT NOT NULL,
                                  "creation_date" TIMESTAMP(6),
                                  "name" TEXT,
                                  "region" TEXT,
                                  "policy_status" JSONB,
                                  "tags" JSONB,

                                  CONSTRAINT "aws_s3_buckets_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_images" (
                                  "_cq_sync_time" TIMESTAMP(6),
                                  "_cq_source_name" TEXT,
                                  "_cq_id" UUID NOT NULL,
                                  "_cq_parent_id" UUID,
                                  "account_id" TEXT NOT NULL,
                                  "region" TEXT NOT NULL,
                                  "arn" TEXT NOT NULL,
                                  "tags" JSONB,
                                  "architecture" TEXT,
                                  "block_device_mappings" JSONB,
                                  "boot_mode" TEXT,
                                  "creation_date" TIMESTAMP(6),
                                  "deprecation_time" TIMESTAMP(6),
                                  "description" TEXT,
                                  "ena_support" BOOLEAN,
                                  "hypervisor" TEXT,
                                  "image_id" TEXT,
                                  "image_location" TEXT,
                                  "image_owner_alias" TEXT,
                                  "image_type" TEXT,
                                  "imds_support" TEXT,
                                  "kernel_id" TEXT,
                                  "name" TEXT,
                                  "owner_id" TEXT,
                                  "platform" TEXT,
                                  "platform_details" TEXT,
                                  "product_codes" JSONB,
                                  "public" BOOLEAN,
                                  "ramdisk_id" TEXT,
                                  "root_device_name" TEXT,
                                  "root_device_type" TEXT,
                                  "source_instance_id" TEXT,
                                  "sriov_net_support" TEXT,
                                  "state" TEXT,
                                  "state_reason" JSONB,
                                  "tpm_support" TEXT,
                                  "usage_operation" TEXT,
                                  "virtualization_type" TEXT,

                                  CONSTRAINT "aws_ec2_images_cqpk" PRIMARY KEY ("account_id","region","arn")
);

-- CreateTable
CREATE TABLE "aws_ec2_instances" (
                                     "_cq_sync_time" TIMESTAMP(6),
                                     "_cq_source_name" TEXT,
                                     "_cq_id" UUID NOT NULL,
                                     "_cq_parent_id" UUID,
                                     "account_id" TEXT,
                                     "region" TEXT,
                                     "arn" TEXT NOT NULL,
                                     "state_transition_reason_time" TIMESTAMP(6),
                                     "tags" JSONB,
                                     "ami_launch_index" BIGINT,
                                     "architecture" TEXT,
                                     "block_device_mappings" JSONB,
                                     "boot_mode" TEXT,
                                     "capacity_reservation_id" TEXT,
                                     "capacity_reservation_specification" JSONB,
                                     "client_token" TEXT,
                                     "cpu_options" JSONB,
                                     "current_instance_boot_mode" TEXT,
                                     "ebs_optimized" BOOLEAN,
                                     "elastic_gpu_associations" JSONB,
                                     "elastic_inference_accelerator_associations" JSONB,
                                     "ena_support" BOOLEAN,
                                     "enclave_options" JSONB,
                                     "hibernation_options" JSONB,
                                     "hypervisor" TEXT,
                                     "iam_instance_profile" JSONB,
                                     "image_id" TEXT,
                                     "instance_id" TEXT,
                                     "instance_lifecycle" TEXT,
                                     "instance_type" TEXT,
                                     "ipv6_address" TEXT,
                                     "kernel_id" TEXT,
                                     "key_name" TEXT,
                                     "launch_time" TIMESTAMP(6),
                                     "licenses" JSONB,
                                     "maintenance_options" JSONB,
                                     "metadata_options" JSONB,
                                     "monitoring" JSONB,
                                     "network_interfaces" JSONB,
                                     "outpost_arn" TEXT,
                                     "placement" JSONB,
                                     "platform" TEXT,
                                     "platform_details" TEXT,
                                     "private_dns_name" TEXT,
                                     "private_dns_name_options" JSONB,
                                     "private_ip_address" TEXT,
                                     "product_codes" JSONB,
                                     "public_dns_name" TEXT,
                                     "public_ip_address" TEXT,
                                     "ramdisk_id" TEXT,
                                     "root_device_name" TEXT,
                                     "root_device_type" TEXT,
                                     "security_groups" JSONB,
                                     "source_dest_check" BOOLEAN,
                                     "spot_instance_request_id" TEXT,
                                     "sriov_net_support" TEXT,
                                     "state" JSONB,
                                     "state_reason" JSONB,
                                     "state_transition_reason" TEXT,
                                     "subnet_id" TEXT,
                                     "tpm_support" TEXT,
                                     "usage_operation" TEXT,
                                     "usage_operation_update_time" TIMESTAMP(6),
                                     "virtualization_type" TEXT,
                                     "vpc_id" TEXT,

                                     CONSTRAINT "aws_ec2_instances_cqpk" PRIMARY KEY ("arn")
);

-- CreateTable
CREATE TABLE "aws_organizations_account_parents" (
                                                     "_cq_sync_time" TIMESTAMP(6),
                                                     "_cq_source_name" TEXT,
                                                     "_cq_id" UUID NOT NULL,
                                                     "_cq_parent_id" UUID,
                                                     "request_account_id" TEXT NOT NULL,
                                                     "id" TEXT NOT NULL,
                                                     "parent_id" TEXT NOT NULL,
                                                     "type" TEXT NOT NULL,

                                                     CONSTRAINT "aws_organizations_account_parents_cqpk" PRIMARY KEY ("request_account_id","id","parent_id","type")
);

-- CreateTable
CREATE TABLE "aws_organizations_accounts" (
                                              "_cq_sync_time" TIMESTAMP(6),
                                              "_cq_source_name" TEXT,
                                              "_cq_id" UUID NOT NULL,
                                              "_cq_parent_id" UUID,
                                              "request_account_id" TEXT NOT NULL,
                                              "tags" JSONB,
                                              "arn" TEXT NOT NULL,
                                              "email" TEXT,
                                              "id" TEXT,
                                              "joined_method" TEXT,
                                              "joined_timestamp" TIMESTAMP(6),
                                              "name" TEXT,
                                              "status" TEXT,

                                              CONSTRAINT "aws_organizations_accounts_cqpk" PRIMARY KEY ("request_account_id","arn")
);

-- CreateTable
CREATE TABLE "aws_organizations_organizational_units" (
                                                          "_cq_sync_time" TIMESTAMP(6),
                                                          "_cq_source_name" TEXT,
                                                          "_cq_id" UUID NOT NULL,
                                                          "_cq_parent_id" UUID,
                                                          "request_account_id" TEXT NOT NULL,
                                                          "arn" TEXT NOT NULL,
                                                          "id" TEXT,
                                                          "name" TEXT,

                                                          CONSTRAINT "aws_organizations_organizational_units_cqpk" PRIMARY KEY ("request_account_id","arn")
);

-- CreateTable
CREATE TABLE "snyk_reporting_latest_issues" (
                                                "_cq_sync_time" TIMESTAMP(6),
                                                "_cq_source_name" TEXT,
                                                "_cq_id" UUID NOT NULL,
                                                "_cq_parent_id" UUID,
                                                "organization_id" TEXT NOT NULL,
                                                "id" TEXT NOT NULL,
                                                "issue" JSONB,
                                                "projects" JSONB,
                                                "project" JSONB,
                                                "is_fixed" BOOLEAN,
                                                "introduced_date" TEXT,
                                                "patched_date" TEXT,
                                                "fixed_date" TEXT,

                                                CONSTRAINT "snyk_reporting_latest_issues_cqpk" PRIMARY KEY ("organization_id","id")
);

-- CreateIndex
CREATE UNIQUE INDEX "aws_cloudformation_stacks__cq_id_key" ON "aws_cloudformation_stacks"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_repositories__cq_id_key" ON "github_repositories"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_repository_branches__cq_id_key" ON "github_repository_branches"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_team_repositories__cq_id_key" ON "github_team_repositories"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_teams__cq_id_key" ON "github_teams"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "github_workflows__cq_id_key" ON "github_workflows"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "snyk_projects__cq_id_key" ON "snyk_projects"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_lambda_functions__cq_id_key" ON "aws_lambda_functions"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_s3_buckets__cq_id_key" ON "aws_s3_buckets"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_images__cq_id_key" ON "aws_ec2_images"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_instances__cq_id_key" ON "aws_ec2_instances"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_organizations_account_parents__cq_id_key" ON "aws_organizations_account_parents"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_organizations_accounts__cq_id_key" ON "aws_organizations_accounts"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_organizations_organizational_units__cq_id_key" ON "aws_organizations_organizational_units"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "snyk_reporting_latest_issues__cq_id_key" ON "snyk_reporting_latest_issues"("_cq_id");

