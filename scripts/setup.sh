#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=${DIR}/..

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

setup_cloudquery() {
  red='\033[0;31m'
  clear='\033[0m'

  DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
  ROOT_DIR=$(realpath "$DIR/..")

  ENV_FILE=$ROOT_DIR/.env
  LOCAL_ENV_FILE=$ROOT_DIR/.env.local

  echo "Creating $LOCAL_ENV_FILE file from $ENV_FILE}"
  cp "$ENV_FILE" "$LOCAL_ENV_FILE"

  echo "Visit https://github.com/settings/tokens?type=beta to create a GitHub token, and add it to $LOCAL_ENV_FILE"
  echo "Visit https://docs.snyk.io/snyk-api-info/authentication-for-api to create a Snyk token, and add it to $LOCAL_ENV_FILE"

  echo "Checking AWS credentials"
  STATUS=$(aws sts get-caller-identity --profile developerPlayground 2>&1 || true)
  if [[ ${STATUS} =~ (ExpiredToken) ]]; then
    echo -e "${red}Credentials for the developerPlayground profile have expired${clear}. Please fetch new credentials."
    exit 1
  elif [[ ${STATUS} =~ ("could not be found") ]]; then
    echo -e "${red}Credentials for the developerPlayground profile are missing${clear}. Please fetch some."
    exit 1
  else
    echo "AWS credentials are valid"
  fi
}

check_node_version
install_dependencies
setup_cloudquery

