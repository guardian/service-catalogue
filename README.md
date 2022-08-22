# CDK Metadata

A lambda that reads Cloudformation templates across our estate, extracts
CDK-related metadata, and writes it as JSON to S3.

It is expected to run daily as a cron job.

Other services (Tracker) can then read the S3 object to get the data.

To read across accounts, the lambda assumes a set of roles that it reads from
Dynamodb - the same roles as Prism currently uses.

To run locally:

    $ PROFILE=deployTools DRY_RUN=true go run main.go

To test:

    $ go test ./...

If you need to install Go: `brew install go`. VS Code is the recommended editor
if unsure.
