# GitHub Lens API

_A lens into your GitHub organisations_, GitHub Lens provides a cached snapshot of your GitHub organisation repositories
and teams via a simple API.

[http://github-lens.gutools.co.uk](http://github-lens.gutools.co.uk)

## Purpose

This service consumes the data recorded in S3 by the [github-data-fetcher](../github-data-fetcher/README.md) lambda
and serves it on an API accessible internal to Guardian VPCs (and via the VPN).

The API provides the following endpoints:

```
[
  {
    "path": "http://github-lens.gutools.co.uk/healthcheck",
    "methods": [
      "get"
    ],
    "info": "Display healthcheck"
  },
  {
    "path": "http://github-lens.gutools.co.uk/repos",
    "methods": [
      "get"
    ],
    "info": "Show all repos, with their team owners"
  },
  {
    "path": "http://github-lens.gutools.co.uk/repos/:name",
    "methods": [
      "get"
    ],
    "info": "Show repo with the provided name, if it exists"
  },
  {
    "path": "http://github-lens.gutools.co.uk/teams",
    "methods": [
      "get"
    ],
    "info": "Show all teams, with the repositories they own"
  },
  {
    "path": "http://github-lens.gutools.co.uk/teams/:name",
    "methods": [
      "get"
    ],
    "info": "Show team with the provided name, if it exists"
  }
]
```

*You can reproduce this path data by querying `http://github-lens.gutools.co.uk/`.*

## Local Development

Start with [Local Development at the root](../../README.md#local-development).

You can run the project locally from this directory by running:

```
npm run dev
```

The application will by default attempt to read the files from S3 at:

- `s3://${BUCKET_NAME}/DEV/teams.json`
- `s3://${BUCKET_NAME}/DEV/repos.json`

You may need to run the [github-data-fetcher](../github-data-fetcher/README.md) lambda locally to generate this files.