#!/usr/bin/env bash

set -e

npm i

npx npm-run-all --print-label --parallel typecheck lint test build 