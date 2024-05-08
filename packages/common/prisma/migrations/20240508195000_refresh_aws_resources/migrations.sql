CREATE OR REPLACE FUNCTION refresh_aws_resources()
    RETURNS TEXT AS
$$
BEGIN
    REFRESH MATERIALIZED VIEW aws_resources WITH DATA;
    RETURN 'Triggered refresh of materialized view aws_resources';
END;
$$
    LANGUAGE plpgsql;