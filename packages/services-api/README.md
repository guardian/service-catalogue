# Services API

The services API itself, providing a team based view on services & repositories.

[https://services.gutools.co.uk/](https://services.gutools.co.uk/).

## Purpose

You can query this API to answer questions like "what version of GuCDK are all my teams projects using?"

```
curl https://services.gutools.co.uk/teams | \
  jq ".[] | select(.id | contains(\"security\")) | .services[].stacks[] | .stackName + \", \" + (.devxFeatures[\"guardianCdkVersion\"] | tostring)"
```

This service consumes the data provided by:

- [github-lens-api](../github-lens-api/README.md)
- [galaxies.gutools.co.uk](https://galaxies.gutools.co.uk/)
- ... and eventually others

The API provides the following endpoints:

```
[
  {
    "path": "http://localhost:3233/healthcheck",
    "methods": [
      "get"
    ],
    "info": "Display healthcheck"
  },
  {
    "path": "http://localhost:3233/teams",
    "methods": [
      "get"
    ],
    "info": "Show all P&E teams, with the services they own"
  },
  {
    "path": "http://localhost:3233/teams/:id",
    "methods": [
      "get"
    ],
    "info": "No path info supplied"
  },
  {
    "path": "http://localhost:3233/people",
    "methods": [
      "get"
    ],
    "info": "Show all P&E people, with their role & GitHub username"
  }
]
```

*You can reproduce this path data by querying `https://services.gutools.co.uk/`.*

## Local Development

Start with [Local Development at the root](../../README.md#local-development).

You can run the project locally from this directory by running:

```
npm run dev
```

The application will by default attempt to read the APIs at:

- [https://github-lens.gutools.co.uk/](https://github-lens.gutools.co.uk/)
- [https://cloudformation-lens.gutools.co.uk/](https://cloudformation-lens.gutools.co.uk/)