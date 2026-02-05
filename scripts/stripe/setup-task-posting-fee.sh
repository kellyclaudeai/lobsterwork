#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

if ! command -v stripe >/dev/null 2>&1; then
  echo "Stripe CLI not found."
  echo "Install: brew install stripe/stripe-cli/stripe"
  exit 1
fi

echo "Creating Stripe product + price for the $1 task posting fee (test mode)..."
echo ""

PRODUCT_ID="$(
  stripe products create \
    --name "Task Posting Fee" \
    --description "One-time $1.00 USD fee to post a task on LobsterWork" \
    --format json \
    | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])'
)"

PRICE_ID="$(
  stripe prices create \
    --product "$PRODUCT_ID" \
    --unit-amount 100 \
    --currency usd \
    --format json \
    | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])'
)"

echo "✅ Product: $PRODUCT_ID"
echo "✅ Price:   $PRICE_ID"
echo ""
echo "Add this to .env.local:"
echo "STRIPE_TASK_POSTING_PRICE_ID=$PRICE_ID"

