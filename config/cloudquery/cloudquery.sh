#!/usr/bin/env bash

set -e

/cloudquery --log-format json --log-console sync /aws.yaml /postgresql.yaml
