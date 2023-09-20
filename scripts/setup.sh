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
  green='\033[0;32m'

  DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

  LOCAL_ENV_FILE_DIR=$HOME/.gu/service_catalogue/secrets

  LOCAL_ENV_FILE=$LOCAL_ENV_FILE_DIR/.env

  SIZE_THRESHOLD=1

  TOKEN_TEXT="# See https://github.com/settings/tokens?type=beta
  GITHUB_ACCESS_TOKEN=

  # See https://docs.snyk.io/snyk-api-info/authentication-for-api
  SNYK_TOKEN="

  echo "Running CloudQuery setup"

  # Check if .env file exists in user's /service_catalogue/secrets/
  echo "Checking to see if you have a local .env file in $LOCAL_ENV_FILE_DIR"
  if [ -e "$LOCAL_ENV_FILE" ]
  then
    # Get file size in bytes
    FILE_SIZE=$(wc -c < "$LOCAL_ENV_FILE")

    # Check if file is empty - don't want to overwrite any existing tokens
    if [ "$FILE_SIZE" -gt "$SIZE_THRESHOLD" ]
    then
      echo -e "${green}Local non-empty .env file found in $LOCAL_ENV_FILE_DIR${clear}. No changes made"
    else
      echo -e "${green}Empty local .env file found in $LOCAL_ENV_FILE_DIR, adding token names${clear}"
      echo "$TOKEN_TEXT" >> "$LOCAL_ENV_FILE"
    fi
  else
    echo -e "${green}No local .env file found - creating it in $LOCAL_ENV_FILE_DIR and adding token names${clear}"
    mkdir -p "$HOME"/.gu/service_catalogue/secrets
    touch -a "$LOCAL_ENV_FILE_DIR"/.env
    echo "$TOKEN_TEXT" >> "$LOCAL_ENV_FILE"
  fi

echo "Visit https://github.com/settings/tokens?type=beta to create a GitHub token, and add it to $LOCAL_ENV_FILE"
echo "Visit https://docs.snyk.io/snyk-api-info/authentication-for-api to create or retrieve a Snyk token, and add it to $LOCAL_ENV_FILE"

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

