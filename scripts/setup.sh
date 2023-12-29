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

setup_environment() {
  step "Setting up Service Catalogue environment"

  local_env_file_dir=$HOME/.gu/service_catalogue

  local_env_file=$local_env_file_dir/.env.local

  size_threshold=1

  GALAXIES_BUCKET=$(aws ssm get-parameter --name /INFRA/deploy/services-api/galaxies-bucket-name --profile deployTools --region eu-west-1 | jq '.Parameter.Value' | tr -d '"')

  ANGHAMMARAD_SNS_ARN=$(aws ssm get-parameter --name /account/services/anghammarad.topic.arn --profile deployTools --region eu-west-1 | jq '.Parameter.Value' | tr -d '"')

  INTERACTIVE_MONITOR_TOPIC_ARN=$(aws sns list-topics --profile deployTools --region eu-west-1 --output text --query 'Topics[*]' | grep interactive-monitor-CODE)

  snyk_info_url="https://docs.snyk.io/snyk-api-info/authentication-for-api"

  JSON_STRING=$(aws secretsmanager get-secret-value --secret-id /CODE/deploy/service-catalogue/github-credentials  --profile deployTools --region eu-west-1 --output text | awk '{print $4}')
  APP_ID=$(echo "$JSON_STRING" | jq -r '."app-id"') #keys need to be quoted otherwise the hyphen is interpreted as a minus sign
  INSTALLATION_ID=$(echo "$JSON_STRING" | jq -r '."installation-id"')

echo "$JSON_STRING" | jq -r '."private-key"' | base64 --decode > "${local_env_file_dir}"/private-key.pem

  token_text="
# See $snyk_info_url
SNYK_TOKEN="
  
  env_var_text="
GALAXIES_BUCKET=${GALAXIES_BUCKET}
ANGHAMMARAD_SNS_ARN=${ANGHAMMARAD_SNS_ARN}
INTERACTIVE_MONITOR_TOPIC_ARN=${INTERACTIVE_MONITOR_TOPIC_ARN}
GITHUB_APP_ID=${APP_ID}
GITHUB_INSTALLATION_ID=${INSTALLATION_ID}
"

  # Check if .env.local file exists in ~/.gu/service_catalogue/
  echo "Checking for .env.local file in $local_env_file_dir"
  if [ -e "$local_env_file" ]
  then
    echo "Found .env.local file in $local_env_file_dir"
    # Get file size in bytes
    file_size=$(wc -c < "$local_env_file")

    # Check if file is empty - don't want to overwrite any existing tokens
    if [ "$file_size" -gt "$size_threshold" ]
    then
      echo "File is not empty. Appending required environment variables only"
      echo "$env_var_text" >> "$local_env_file"
    else
      echo "File is empty, adding Github and Snyk token names"
      echo "$token_text" >> "$local_env_file"
      echo "Appending required environment variables"
      echo "$env_var_text" >> "$local_env_file"
    fi
  else
    echo "No .env.local file found - creating it in $local_env_file_dir"
    mkdir -p "$HOME"/.gu/service_catalogue
    touch -a "$local_env_file_dir"/.env.local
    echo "Adding Snyk token name and required environment variables"
    echo "$token_text" >> "$local_env_file"
    echo "$env_var_text" >> "$local_env_file"
  fi

source "$local_env_file"

  # Check if Snyk token is set
  if [ -z "$SNYK_TOKEN" ]
  then
    echo -e "${yellow}Please create or retrieve a Snyk token${clear}.
Visit ${cyan}$snyk_info_url${clear}, and add it to ${cyan}$local_env_file${clear}"
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
setup_environment

echo -e "${cyan}Setup complete${clear} ✅"
