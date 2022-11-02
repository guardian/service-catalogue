# CDK Metadata

A simple EC2 service that does two things:

1. Crawls Guardian AWS accounts to collect data on Cloudformation stacks
2. Serves this data as an HTTP (JSON) API

To run locally:

    $ go run main.go --profile [profile] --in-memory --do-crawl

To test:

    $ go test ./...

If you need to install Go: `brew install go`. VS Code is the recommended editor
if unsure.
