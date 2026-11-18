begin transaction;
CREATE INDEX IF NOT EXISTS idx_ssecurityhub_findings_control_id
    ON aws_securityhub_findings ((product_fields ->>'ControlId'))
    INCLUDE (id)
    WHERE workflow ->>'Status' != 'SUPPRESSED'
        AND generator_id LIKE '%aws-foundational-security-best-practices%'
        AND severity ->>'Label' IN ('HIGH', 'CRITICAL');
commit transaction;

