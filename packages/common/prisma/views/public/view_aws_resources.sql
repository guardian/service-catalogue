SELECT
  aws_ec2_instances._cq_id,
  aws_ec2_instances._cq_source_name,
  aws_ec2_instances._cq_sync_time,
  'aws_ec2_instances' :: text AS _cq_table,
  COALESCE(
    aws_ec2_instances.account_id,
    split_part(aws_ec2_instances.arn, ':' :: text, 5)
  ) AS account_id,
  COALESCE(
    NULL :: text,
    aws_ec2_instances.account_id,
    split_part(aws_ec2_instances.arn, ':' :: text, 5)
  ) AS request_account_id,
  aws_ec2_instances.region,
  split_part(aws_ec2_instances.arn, ':' :: text, 2) AS PARTITION,
  split_part(aws_ec2_instances.arn, ':' :: text, 3) AS service,
  CASE
    WHEN (
      (
        split_part(
          split_part(aws_ec2_instances.arn, ':' :: text, 6),
          '/' :: text,
          2
        ) = '' :: text
      )
      AND (
        split_part(aws_ec2_instances.arn, ':' :: text, 7) = '' :: text
      )
    ) THEN NULL :: text
    ELSE split_part(
      split_part(aws_ec2_instances.arn, ':' :: text, 6),
      '/' :: text,
      1
    )
  END AS TYPE,
  aws_ec2_instances.arn,
  aws_ec2_instances.tags
FROM
  aws_ec2_instances
UNION
ALL
SELECT
  aws_ec2_images._cq_id,
  aws_ec2_images._cq_source_name,
  aws_ec2_images._cq_sync_time,
  'aws_ec2_images' :: text AS _cq_table,
  COALESCE(
    aws_ec2_images.account_id,
    split_part(aws_ec2_images.arn, ':' :: text, 5)
  ) AS account_id,
  COALESCE(
    NULL :: text,
    aws_ec2_images.account_id,
    split_part(aws_ec2_images.arn, ':' :: text, 5)
  ) AS request_account_id,
  aws_ec2_images.region,
  split_part(aws_ec2_images.arn, ':' :: text, 2) AS PARTITION,
  split_part(aws_ec2_images.arn, ':' :: text, 3) AS service,
  CASE
    WHEN (
      (
        split_part(
          split_part(aws_ec2_images.arn, ':' :: text, 6),
          '/' :: text,
          2
        ) = '' :: text
      )
      AND (
        split_part(aws_ec2_images.arn, ':' :: text, 7) = '' :: text
      )
    ) THEN NULL :: text
    ELSE split_part(
      split_part(aws_ec2_images.arn, ':' :: text, 6),
      '/' :: text,
      1
    )
  END AS TYPE,
  aws_ec2_images.arn,
  aws_ec2_images.tags
FROM
  aws_ec2_images
UNION
ALL
SELECT
  aws_cloudformation_stacks._cq_id,
  aws_cloudformation_stacks._cq_source_name,
  aws_cloudformation_stacks._cq_sync_time,
  'aws_cloudformation_stacks' :: text AS _cq_table,
  COALESCE(
    aws_cloudformation_stacks.account_id,
    split_part(aws_cloudformation_stacks.arn, ':' :: text, 5)
  ) AS account_id,
  COALESCE(
    NULL :: text,
    aws_cloudformation_stacks.account_id,
    split_part(aws_cloudformation_stacks.arn, ':' :: text, 5)
  ) AS request_account_id,
  aws_cloudformation_stacks.region,
  split_part(aws_cloudformation_stacks.arn, ':' :: text, 2) AS PARTITION,
  split_part(aws_cloudformation_stacks.arn, ':' :: text, 3) AS service,
  CASE
    WHEN (
      (
        split_part(
          split_part(aws_cloudformation_stacks.arn, ':' :: text, 6),
          '/' :: text,
          2
        ) = '' :: text
      )
      AND (
        split_part(aws_cloudformation_stacks.arn, ':' :: text, 7) = '' :: text
      )
    ) THEN NULL :: text
    ELSE split_part(
      split_part(aws_cloudformation_stacks.arn, ':' :: text, 6),
      '/' :: text,
      1
    )
  END AS TYPE,
  aws_cloudformation_stacks.arn,
  aws_cloudformation_stacks.tags
FROM
  aws_cloudformation_stacks
UNION
ALL
SELECT
  aws_organizations_accounts._cq_id,
  aws_organizations_accounts._cq_source_name,
  aws_organizations_accounts._cq_sync_time,
  'aws_organizations_accounts' :: text AS _cq_table,
  COALESCE(
    NULL :: text,
    split_part(aws_organizations_accounts.arn, ':' :: text, 5)
  ) AS account_id,
  COALESCE(
    aws_organizations_accounts.request_account_id,
    NULL :: text,
    split_part(aws_organizations_accounts.arn, ':' :: text, 5)
  ) AS request_account_id,
  'unavailable' :: text AS region,
  split_part(aws_organizations_accounts.arn, ':' :: text, 2) AS PARTITION,
  split_part(aws_organizations_accounts.arn, ':' :: text, 3) AS service,
  CASE
    WHEN (
      (
        split_part(
          split_part(aws_organizations_accounts.arn, ':' :: text, 6),
          '/' :: text,
          2
        ) = '' :: text
      )
      AND (
        split_part(aws_organizations_accounts.arn, ':' :: text, 7) = '' :: text
      )
    ) THEN NULL :: text
    ELSE split_part(
      split_part(aws_organizations_accounts.arn, ':' :: text, 6),
      '/' :: text,
      1
    )
  END AS TYPE,
  aws_organizations_accounts.arn,
  aws_organizations_accounts.tags
FROM
  aws_organizations_accounts
UNION
ALL
SELECT
  aws_organizations_organizational_units._cq_id,
  aws_organizations_organizational_units._cq_source_name,
  aws_organizations_organizational_units._cq_sync_time,
  'aws_organizations_organizational_units' :: text AS _cq_table,
  COALESCE(
    NULL :: text,
    split_part(
      aws_organizations_organizational_units.arn,
      ':' :: text,
      5
    )
  ) AS account_id,
  COALESCE(
    aws_organizations_organizational_units.request_account_id,
    NULL :: text,
    split_part(
      aws_organizations_organizational_units.arn,
      ':' :: text,
      5
    )
  ) AS request_account_id,
  'unavailable' :: text AS region,
  split_part(
    aws_organizations_organizational_units.arn,
    ':' :: text,
    2
  ) AS PARTITION,
  split_part(
    aws_organizations_organizational_units.arn,
    ':' :: text,
    3
  ) AS service,
  CASE
    WHEN (
      (
        split_part(
          split_part(
            aws_organizations_organizational_units.arn,
            ':' :: text,
            6
          ),
          '/' :: text,
          2
        ) = '' :: text
      )
      AND (
        split_part(
          aws_organizations_organizational_units.arn,
          ':' :: text,
          7
        ) = '' :: text
      )
    ) THEN NULL :: text
    ELSE split_part(
      split_part(
        aws_organizations_organizational_units.arn,
        ':' :: text,
        6
      ),
      '/' :: text,
      1
    )
  END AS TYPE,
  aws_organizations_organizational_units.arn,
  '{}' :: jsonb AS tags
FROM
  aws_organizations_organizational_units
UNION
ALL
SELECT
  aws_lambda_functions._cq_id,
  aws_lambda_functions._cq_source_name,
  aws_lambda_functions._cq_sync_time,
  'aws_lambda_functions' :: text AS _cq_table,
  COALESCE(
    aws_lambda_functions.account_id,
    split_part(aws_lambda_functions.arn, ':' :: text, 5)
  ) AS account_id,
  COALESCE(
    NULL :: text,
    aws_lambda_functions.account_id,
    split_part(aws_lambda_functions.arn, ':' :: text, 5)
  ) AS request_account_id,
  aws_lambda_functions.region,
  split_part(aws_lambda_functions.arn, ':' :: text, 2) AS PARTITION,
  split_part(aws_lambda_functions.arn, ':' :: text, 3) AS service,
  CASE
    WHEN (
      (
        split_part(
          split_part(aws_lambda_functions.arn, ':' :: text, 6),
          '/' :: text,
          2
        ) = '' :: text
      )
      AND (
        split_part(aws_lambda_functions.arn, ':' :: text, 7) = '' :: text
      )
    ) THEN NULL :: text
    ELSE split_part(
      split_part(aws_lambda_functions.arn, ':' :: text, 6),
      '/' :: text,
      1
    )
  END AS TYPE,
  aws_lambda_functions.arn,
  aws_lambda_functions.tags
FROM
  aws_lambda_functions
UNION
ALL
SELECT
  aws_s3_buckets._cq_id,
  aws_s3_buckets._cq_source_name,
  aws_s3_buckets._cq_sync_time,
  'aws_s3_buckets' :: text AS _cq_table,
  COALESCE(
    aws_s3_buckets.account_id,
    split_part(aws_s3_buckets.arn, ':' :: text, 5)
  ) AS account_id,
  COALESCE(
    NULL :: text,
    aws_s3_buckets.account_id,
    split_part(aws_s3_buckets.arn, ':' :: text, 5)
  ) AS request_account_id,
  aws_s3_buckets.region,
  split_part(aws_s3_buckets.arn, ':' :: text, 2) AS PARTITION,
  split_part(aws_s3_buckets.arn, ':' :: text, 3) AS service,
  CASE
    WHEN (
      (
        split_part(
          split_part(aws_s3_buckets.arn, ':' :: text, 6),
          '/' :: text,
          2
        ) = '' :: text
      )
      AND (
        split_part(aws_s3_buckets.arn, ':' :: text, 7) = '' :: text
      )
    ) THEN NULL :: text
    ELSE split_part(
      split_part(aws_s3_buckets.arn, ':' :: text, 6),
      '/' :: text,
      1
    )
  END AS TYPE,
  aws_s3_buckets.arn,
  aws_s3_buckets.tags
FROM
  aws_s3_buckets;