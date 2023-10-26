-- CreateTable
CREATE TABLE "aws_ec2_vpc_endpoint_connections" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "tags" JSONB,
    "creation_timestamp" TIMESTAMP(6),
    "dns_entries" JSONB,
    "gateway_load_balancer_arns" TEXT[],
    "ip_address_type" TEXT,
    "network_load_balancer_arns" TEXT[],
    "service_id" TEXT,
    "vpc_endpoint_connection_id" TEXT NOT NULL,
    "vpc_endpoint_id" TEXT,
    "vpc_endpoint_owner" TEXT NOT NULL,
    "vpc_endpoint_state" TEXT,

    CONSTRAINT "aws_ec2_vpc_endpoint_connections_cqpk" PRIMARY KEY ("account_id","region","vpc_endpoint_connection_id","vpc_endpoint_owner")
);

-- CreateTable
CREATE TABLE "aws_s3_bucket_notification_configurations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "bucket_arn" TEXT NOT NULL,
    "event_bridge_configuration" JSONB,
    "lambda_function_configurations" JSONB,
    "queue_configurations" JSONB,
    "topic_configurations" JSONB,

    CONSTRAINT "aws_s3_bucket_notification_configurations_cqpk" PRIMARY KEY ("bucket_arn")
);

-- CreateTable
CREATE TABLE "aws_s3_bucket_object_lock_configurations" (
    "_cq_sync_time" TIMESTAMP(6),
    "_cq_source_name" TEXT,
    "_cq_id" UUID NOT NULL,
    "_cq_parent_id" UUID,
    "account_id" TEXT,
    "bucket_arn" TEXT NOT NULL,
    "object_lock_enabled" TEXT,
    "rule" JSONB,

    CONSTRAINT "aws_s3_bucket_object_lock_configurations_cqpk" PRIMARY KEY ("bucket_arn")
);

-- CreateIndex
CREATE UNIQUE INDEX "aws_ec2_vpc_endpoint_connections__cq_id_key" ON "aws_ec2_vpc_endpoint_connections"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_s3_bucket_notification_configurations__cq_id_key" ON "aws_s3_bucket_notification_configurations"("_cq_id");

-- CreateIndex
CREATE UNIQUE INDEX "aws_s3_bucket_object_lock_configurations__cq_id_key" ON "aws_s3_bucket_object_lock_configurations"("_cq_id");
