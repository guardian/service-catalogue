# CloudQuery Usage
Tracks the number of rows collected with [CloudQuery plugin, per day](https://api-docs.cloudquery.io/#tag/teams/operation/GetGroupedTeamUsageSummary).
The resulting table `cloudquery_plugin_usage` powers the [Grafana dashboard CloudQuery paid usage](https://metrics.gutools.co.uk/d/debncbyh7b37ke/cloudquery-paid-usage).

By default, yesterday's data is collected. To customise this, set the `START_DATE` and `END_DATE` environment variables.

## Running locally
With your local environment running, run:

```bash
npm -w cloudquery-usage start
```

## Running on PROD
This runs within AWS Lambda.