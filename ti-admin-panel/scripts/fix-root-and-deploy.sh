#!/bin/bash
# Fix Vercel Root Directory and deploy
# The project has rootDirectory="ti-admin-panel" which breaks deploys from this standalone folder.
# This script updates it via API, then deploys.

set -e

PROJECT_ID="prj_OxZdJOwoTYFGVnYB8odcgKgHX4LM"
TEAM_ID="team_Kq7eHhEpPoBefgRutQYo5tmN"

if [ -z "$VERCEL_TOKEN" ]; then
  echo "ERROR: VERCEL_TOKEN is required."
  echo ""
  echo "Create a token at: https://vercel.com/account/tokens"
  echo "Then run: VERCEL_TOKEN=your_token ./scripts/fix-root-and-deploy.sh"
  exit 1
fi

echo "Updating Vercel project rootDirectory to empty..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
  "https://api.vercel.com/v9/projects/${PROJECT_ID}?teamId=${TEAM_ID}" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory": ""}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "Root directory updated successfully."
else
  echo "API error (HTTP $HTTP_CODE): $BODY"
  exit 1
fi

echo "Deploying to Vercel production..."
vercel --prod --yes
