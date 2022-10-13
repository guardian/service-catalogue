#!/bin/bash

set -e

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

setup_node_env() {
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

  npm install
}

download_local_config
setup_node_env
