-- Remove Obligatron results for AMI tagging against non P&E accounts
DELETE FROM obligatron_results
WHERE       resource LIKE 'arn:aws:ec2:%:%:image/ami-%'
            AND contacts ->> 'aws_account' IN (
                SELECT id FROM aws_accounts WHERE is_product_and_engineering = FALSE
            )
