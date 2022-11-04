# CDK Metadata

A simple EC2 service that does two things:

1. Crawls Guardian AWS accounts to collect data on Cloudformation stacks
2. Serves this data as an HTTP (JSON) API

To run locally (profile: Set to use a specific profile when testing locally e.g. deployTools), you will need to apply the credentials from janus first.

     $ go run main.go --profile [profile] --in-memory

Endpoints are
    http://localhost:8900/healthcheck
    http://localhost:8900/stacks

There is a --no-crawl flag availabel for ease of development

To test:

    $ go test ./...

If you need to install Go: `brew install go`. VS Code is the recommended editor
if unsure.