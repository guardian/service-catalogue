-- CreateTable
CREATE TABLE IF NOT EXISTS "galaxies_people_profile_info_table" (
    "_cq_source_name" TEXT,
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "id" TEXT,
    "email" TEXT,
    "pronouns" TEXT,
    "git_hub_handle" TEXT,
    "twitter_handle" TEXT,
    "picture_url" TEXT,

    CONSTRAINT "galaxies_people_profile_info_table_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "galaxies_people_table" (
    "_cq_source_name" TEXT,
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "name" TEXT,
    "email_id" TEXT,
    "role" TEXT,
    "teams" TEXT[],
    "streams" TEXT[],

    CONSTRAINT "galaxies_people_table_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "galaxies_streams_table" (
    "_cq_source_name" TEXT,
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "stream_id" TEXT,
    "stream_name" TEXT,
    "stream_description" TEXT,
    "stream_members" TEXT[],

    CONSTRAINT "galaxies_streams_table_cqpk" PRIMARY KEY ("_cq_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "galaxies_teams_table" (
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
