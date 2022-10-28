#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=${DIR}/..

STAGE=DEV
APP=github-lens
STACK=deploy

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

download_local_config
check_node_version
install_dependencies
