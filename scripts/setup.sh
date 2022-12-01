#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=${DIR}/..

STAGE=DEV
APP=github-lens
STACK=deploy

setup_git_hook() {
  echo "Setting up repocop pre-commit hook"
  printf '#!/bin/sh


REPOCOP_CHANGES=$(git status --short packages/repocop/)
if [[ -n "$REPOCOP_CHANGES" ]]
then
    printf "RepoCop changes detected"
    printf "\n\nRunning markdown snapshot test. If this fails, regenerate the markdown file, stage the changes, and commit again"
    printf "\nIt can take several seconds for sbt to start up. Sit tight...\n\n"
    (cd packages/repocop && sbt "testOnly *MarkdownSpec")
else
    echo "No repocop changes detected, skipping git hook"
fi
' > "${ROOT_DIR}/.git/hooks/pre-commit"

chmod +x "${ROOT_DIR}/.git/hooks/pre-commit"
}



download_local_config () {
  COMMON_PARAMS="--profile deployTools --region eu-west-1"
  BUCKET=$(aws ssm get-parameter --name /account/services/artifact.bucket ${COMMON_PARAMS} | jq -r .Parameter.Value)
  DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

  if [ "$BUCKET" ]; then
    aws s3 cp s3://"$BUCKET"/$STACK/$STAGE/$APP/.env "$DIR/../.env" ${COMMON_PARAMS}
  else
    echo "Could not get artifact bucket parameter value from SSM, make sure you have deployTools credentials configured."
    exit 1
  fi
}

check_node_version() {
  runningNodeVersion=$(node -v)
  requiredNodeVersion=$(cat "$ROOT_DIR/.nvmrc")

  # remove leading v
  runningNodeVersionNumber=${runningNodeVersion//[v]/}

  if [ "$runningNodeVersionNumber" != "$requiredNodeVersion" ]; then
    echo -e "Using wrong version of Node. Required ${requiredNodeVersion}. Running ${runningNodeVersion}."
    setup_node_env
  fi
}

setup_node_env() {
  echo "Attempting to switch node versions for you..."
  if command -v fnm &> /dev/null
  then
      fnm use
  else
    if command -v nvm &> /dev/null
    then
      echo "You are using 'nvm', 'fnm' is preferred (it's quicker)!"
      nvm use
    else
      echo "Please install fnm: 'brew install fnm'"
      exit 1
    fi
  fi
}

install_dependencies() {
  npm install
}

setup_git_hook
download_local_config
check_node_version
install_dependencies
