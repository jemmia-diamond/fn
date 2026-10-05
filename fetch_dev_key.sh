#!/bin/bash
set -e

# ==========================================
# CONFIGURATION
# Modify these variables for other projects!
# ==========================================
TARGET=".dev.vars"
PROJECT_ID="79601934-6801-4afa-a075-60fcc40d90f8"
ENV="prod"
SECRET_PATH="/commons/public"
INFISICAL_DOMAIN="https://infisical.jemmia.vn"
# ==========================================

TMPFILE=$(mktemp)

# Extract PUBLIC_INFISICAL_TOKEN from .dev.vars if it exists
if grep -q "^PUBLIC_INFISICAL_TOKEN=" "$TARGET"; then
  # Sourcing .dev.vars might fail if there are unquoted spaces, so we grep it
  export PUBLIC_INFISICAL_TOKEN=$(grep "^PUBLIC_INFISICAL_TOKEN=" "$TARGET" | cut -d '=' -f2- | tr -d '"' | tr -d "'")
fi

if [ -z "$PUBLIC_INFISICAL_TOKEN" ]; then
  echo "Error: PUBLIC_INFISICAL_TOKEN is not set in $TARGET."
  echo "Please ask your admin for the token and add it to $TARGET as:"
  echo "PUBLIC_INFISICAL_TOKEN='st.xxxxxxxxxxxx...'"
  exit 1
fi

# Fetch secrets from Infisical into a temp file
if command -v infisical &> /dev/null; then
  echo "Using Infisical CLI to fetch secrets..."
  INFISICAL_TOKEN="$PUBLIC_INFISICAL_TOKEN" \
  infisical export \
    --projectId="$PROJECT_ID" \
    --env="$ENV" \
    --path="$SECRET_PATH" \
    --format=dotenv \
    --domain="$INFISICAL_DOMAIN/api" \
    --silent > "$TMPFILE"
else
  echo "Infisical CLI not found. Falling back to curl + jq..."
  if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed. Please install jq or the Infisical CLI."
    exit 1
  fi
  curl -s -X GET "$INFISICAL_DOMAIN/api/v3/secrets/raw?workspaceId=$PROJECT_ID&environment=$ENV&secretPath=$SECRET_PATH" \
    -H "Authorization: Bearer $PUBLIC_INFISICAL_TOKEN" \
    | jq -r '.secrets[] | .secretKey + "='\''" + .secretValue + "'\''"' > "$TMPFILE"
fi

# For each KEY=VALUE in the fetched secrets:
# - Replace the line in .dev.vars if the key exists
# - Append it if the key is missing
while IFS= read -r line; do
  # Skip empty lines or comments
  [[ -z "$line" || "$line" == \#* ]] && continue

  KEY="${line%%=*}"

  if grep -q "^${KEY}=" "$TARGET"; then
    # Key exists — replace in-place
    sed -i '' "s|^${KEY}=.*|${line}|" "$TARGET"
    echo "Updated: $KEY"
  else
    # Key missing — append
    echo "$line" >> "$TARGET"
    echo "Added:   $KEY"
  fi
done < "$TMPFILE"

rm "$TMPFILE"
echo "Done. $TARGET updated."
