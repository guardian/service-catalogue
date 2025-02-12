BEGIN TRANSACTION;
    CREATE TABLE IF NOT EXISTS "aws_ec2_route_tables" (
        "_cq_sync_time" TIMESTAMP(6),
        "_cq_source_name" TEXT,
        "_cq_id" UUID NOT NULL,
        "_cq_parent_id" UUID,
        "account_id" TEXT,
        "region" TEXT,
        "arn" TEXT,
        "tags" JSONB,
        "associations" JSONB,
        "owner_id" TEXT,
        "propagating_vgws" JSONB,
        "route_table_id" TEXT,
        "routes" JSONB,
        "vpc_id" TEXT,

        CONSTRAINT "aws_ec2_route_tables_cqpk" PRIMARY KEY ("_cq_id")
    );
    
    CREATE TABLE IF NOT EXISTS "aws_ec2_subnets" (
        "_cq_sync_time" TIMESTAMP(6),
        "_cq_source_name" TEXT,
        "_cq_id" UUID NOT NULL,
        "_cq_parent_id" UUID,
        "request_account_id" TEXT,
        "request_region" TEXT,
        "arn" TEXT,
        "tags" JSONB,
        "assign_ipv6_address_on_creation" BOOLEAN,
        "availability_zone" TEXT,
        "availability_zone_id" TEXT,
        "available_ip_address_count" BIGINT,
        "cidr_block" TEXT,
        "customer_owned_ipv4_pool" TEXT,
        "default_for_az" BOOLEAN,
        "enable_dns64" BOOLEAN,
        "enable_lni_at_device_index" BIGINT,
        "ipv6_cidr_block_association_set" JSONB,
        "ipv6_native" BOOLEAN,
        "map_customer_owned_ip_on_launch" BOOLEAN,
        "map_public_ip_on_launch" BOOLEAN,
        "outpost_arn" TEXT,
        "owner_id" TEXT,
        "private_dns_name_options_on_launch" JSONB,
        "state" TEXT,
        "subnet_arn" TEXT,
        "subnet_id" TEXT,
        "vpc_id" TEXT,

        CONSTRAINT "aws_ec2_subnets_cqpk" PRIMARY KEY ("_cq_id")
    );

    CREATE TABLE IF NOT EXISTS "aws_ec2_vpcs" (
        "_cq_sync_time" TIMESTAMP(6),
        "_cq_source_name" TEXT,
        "_cq_id" UUID NOT NULL,
        "_cq_parent_id" UUID,
        "account_id" TEXT,
        "region" TEXT,
        "arn" TEXT,
        "tags" JSONB,
        "cidr_block" TEXT,
        "cidr_block_association_set" JSONB,
        "dhcp_options_id" TEXT,
        "instance_tenancy" TEXT,
        "ipv6_cidr_block_association_set" JSONB,
        "is_default" BOOLEAN,
        "owner_id" TEXT,
        "state" TEXT,
        "vpc_id" TEXT,

        CONSTRAINT "aws_ec2_vpcs_cqpk" PRIMARY KEY ("_cq_id")
    );
COMMIT TRANSACTION;