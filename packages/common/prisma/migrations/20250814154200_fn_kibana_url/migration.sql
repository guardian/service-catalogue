BEGIN TRANSACTION;
    CREATE OR REPLACE FUNCTION fn_kibana_url(
        stage       TEXT
        , apps      TEXT[]
        , space     TEXT
        , level     TEXT DEFAULT 'ERROR'
        , from_time TEXT DEFAULT 'now-15m'
        , to_time   TEXT DEFAULT 'now'
    ) RETURNS TEXT AS $func$
        WITH transformed AS (
            SELECT  string_agg(quote_literal(app), ',') AS app_meta
                    , string_agg(format('(match_phrase:(''app.keyword'': %s))', quote_literal(app)), ',') as app_query
            FROM    unnest(apps) AS app
        )

        SELECT  regexp_replace(
                    format(
                        -- Dollar quoting to create a multi-line string
                        $url$
                        https://logs.gutools.co.uk/s/%1$s/app/discover#/?
                            _a=(
                                breakdownField:'app.keyword'
                                , columns:!(
                                    app
                                    , logger_name
                                    , level
                                    , message
                                )
                                , filters:!(
                                    (
                                        meta:(
                                            field:'app.keyword'
                                            , key:'app.keyword'
                                            , type:phrases
                                            , params:!( %2$s )
                                            , value:!( %2$s )
                                        )
                                        , query:(
                                            bool:(
                                                minimum_should_match:1
                                                , should:!( %3$s )
                                            )
                                        )
                                    )
                                , (
                                    query:(
                                        match_phrase:('level.keyword': %4$s )
                                    )
                                ), (
                                    query:(
                                        match_phrase:('stage.keyword': %5$s )
                                    )
                                )
                            ))
                            &_g=(
                                time:(
                                    from: %6$s
                                    , to: %7$s
                                )
                            )
                        $url$
                        , space
                        , transformed.app_meta
                        , transformed.app_query
                        , quote_literal(level)
                        , quote_literal(stage)
                        , quote_literal(from_time)
                        , quote_literal(to_time)
                    )
                    -- A multi-line string isn't a URL, so now remove all newlines and spaces
                    , '\n|\s'
                    , ''
                    , 'g'
                )
        FROM    transformed;
    $func$ LANGUAGE SQL;

    COMMENT ON FUNCTION fn_kibana_url(TEXT, TEXT[], TEXT, TEXT, TEXT, TEXT) IS 'Returns a deep-link to Central ELK for a set of apps. By default ERROR logs are returned.';
COMMIT TRANSACTION;