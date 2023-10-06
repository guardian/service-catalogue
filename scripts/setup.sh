#!/usr/bin/env bash

set -e

# Set up text colours
red='\033[0;31m'
clear='\033[0m'
yellow='\033[1;33m'
cyan='\033[0;36m'

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=$(realpath "${DIR}/..")
STEP_COUNT=0

step(){
  ((STEP_COUNT++))
  echo -e "${cyan}Step ${STEP_COUNT}${clear}: $1"
}

check_node_version() {
  step "Checking node version"
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
  step "Setting up node environment"
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
  step "Installing dependencies"
  npm install --silent
}

check_credentials() {
  step "Checking AWS credentials"
  PROFILE=$1
  STATUS=$(aws sts get-caller-identity --profile "$PROFILE" 2>&1 || true)
  if [[ ${STATUS} =~ (ExpiredToken) ]]; then
    echo -e "${red}Credentials for the ${yellow}$PROFILE${red} profile have expired${clear}. Please fetch new credentials and rerun the script."
    exit 1
  elif [[ ${STATUS} =~ ("could not be found") ]]; then
    echo -e "${red}Credentials for the ${yellow}$PROFILE${red} profile are missing${clear}. Please fetch new credentials and rerun the script."
    exit 1
  else
    echo "AWS credentials for $PROFILE are valid"
  fi
}

setup_cloudquery() {
  step "Setting up CloudQuery"
  DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

  LOCAL_ENV_FILE_DIR=$HOME/.gu/service_catalogue

  LOCAL_ENV_FILE=$LOCAL_ENV_FILE_DIR/.env.local

  SIZE_THRESHOLD=1

  GALAXIES_BUCKET=$(aws ssm get-parameter --name /INFRA/deploy/services-api/galaxies-bucket-name --profile deployTools --region eu-west-1 | jq '.Parameter.Value' | tr -d '"')

  TOKEN_TEXT="# See https://github.com/settings/tokens?type=beta
GITHUB_ACCESS_TOKEN=

# See https://docs.snyk.io/snyk-api-info/authentication-for-api
SNYK_TOKEN=

GALAXIES_BUCKET=${GALAXIES_BUCKET}
"

  echo "Running CloudQuery setup"

  # Check if .env.local file exists in ~/.gu/service_catalogue/
  echo "Checking for .env.local file in $LOCAL_ENV_FILE_DIR"
  if [ -e "$LOCAL_ENV_FILE" ]
  then
    # Get file size in bytes
    FILE_SIZE=$(wc -c < "$LOCAL_ENV_FILE")

    # Check if file is empty - don't want to overwrite any existing tokens
    if [ "$FILE_SIZE" -gt "$SIZE_THRESHOLD" ]
    then
      echo "Detected env.local. No changes made."
    else
      echo "Empty .env.local file found in $LOCAL_ENV_FILE_DIR, adding token names$"
      echo "$TOKEN_TEXT" >> "$LOCAL_ENV_FILE"
    fi
  else
    echo "No .env.local file found - creating it in $LOCAL_ENV_FILE_DIR and adding token names"
    mkdir -p "$HOME"/.gu/service_catalogue
    touch -a "$LOCAL_ENV_FILE_DIR"/.env.local
    echo "$TOKEN_TEXT" >> "$LOCAL_ENV_FILE"
  fi

source "$LOCAL_ENV_FILE"

  # Check if GitHub token is set
  if [ -z "$GITHUB_ACCESS_TOKEN" ]
  then
    echo -e "${yellow}Please create a GitHub token${clear}.
Visit ${cyan}https://github.com/settings/tokens?type=beta${clear}, and add it to ${cyan}$LOCAL_ENV_FILE${clear}"
  fi

  # Check if Snyk token is set
  if [ -z "$SNYK_TOKEN" ]
  then
    echo -e "${yellow}Please create or retrieve a Snyk token${clear}.
Visit ${cyan}https://docs.snyk.io/snyk-api-info/authentication-for-api${clear}, and add it to ${cyan}$LOCAL_ENV_FILE${clear}"
  fi
}

setup_hook() {
  HOOK_NAME=$1
  step "Setting up $HOOK_NAME hook"
  cp "$ROOT_DIR/.hooks/$HOOK_NAME" "$ROOT_DIR/.git/hooks/$HOOK_NAME"
  chmod +x "$ROOT_DIR/.git/hooks/$HOOK_NAME"
}

setup_hook pre-commit
check_node_version
install_dependencies
check_credentials deployTools
setup_cloudquery

echo -e "${cyan}Setup complete${clear} ✅"
