# Cloudformation Lens

A simple EC2 service that does two things:

1. Crawls Guardian AWS accounts to collect data on Cloudformation stacks
2. Serves this data as an HTTP (JSON) API

To run locally:

     $ go run main.go --profile [profile] --in-memory

(`profile` should be your Janus profile.)

See the root ('/') for available endpoints.

Various flags are available to control crawling behaviour for local development.
To list these and their descriptions, run:

    $ go run main.go -h

To test:

    $ go test ./...

If you need to install Go: `brew install go`. VS Code is the recommended editor
if unsure.