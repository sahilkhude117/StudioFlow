#!/bin/sh

set -e

if [ ! -f /studioflow/storage/.env ]; then
  >&2 echo "Saving environment variables"
  ENCRYPTION_KEY="${ENCRYPTION_KEY:-$(openssl rand -base64 36)}"
  WEBHOOK_SECRET_KEY="${WEBHOOK_SECRET_KEY:-$(openssl rand -base64 36)}"
  APP_SECRET_KEY="${APP_SECRET_KEY:-$(openssl rand -base64 36)}"
  echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> /studioflow/storage/.env
  echo "WEBHOOK_SECRET_KEY=$WEBHOOK_SECRET_KEY" >> /studioflow/storage/.env
  echo "APP_SECRET_KEY=$APP_SECRET_KEY" >> /studioflow/storage/.env
fi

# initiate env. vars. from /studioflow/storage/.env file
export $(grep -v '^#' /studioflow/storage/.env | xargs)

# migration for webhook secret key, will be removed in the future.
if [[ -z "${WEBHOOK_SECRET_KEY}" ]]; then
  WEBHOOK_SECRET_KEY="$(openssl rand -base64 36)"
  echo "WEBHOOK_SECRET_KEY=$WEBHOOK_SECRET_KEY" >> /studioflow/storage/.env
fi

echo "Environment variables have been set!"

sh /entrypoint.sh
