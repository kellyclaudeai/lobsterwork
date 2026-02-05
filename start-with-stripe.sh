#!/bin/bash

# LobsterWork - Start with Stripe Payment Processing
echo "🦞 Starting LobsterWork with Stripe payment processing..."
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI is not installed"
    echo "Install it with: brew install stripe/stripe-cli/stripe"
    exit 1
fi

echo "✅ Stripe CLI found"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found"
    echo "Please create .env.local with your Stripe keys"
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting development server..."
echo ""
echo "📝 Next steps:"
echo ""
echo "1. In a NEW terminal, run:"
echo "   cd ~/.openclaw/projects/lobsterwork"
echo "   stripe listen --forward-to localhost:3000/api/webhooks/stripe"
echo ""
echo "2. Copy the webhook secret (whsec_...) from that terminal"
echo ""
echo "3. Update .env.local with:"
echo "   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here"
echo ""
echo "4. Restart this dev server (Ctrl+C and run npm run dev again)"
echo ""
echo "5. Visit http://localhost:3000 and test task posting!"
echo ""
echo "Test card: 4242 4242 4242 4242 (any future expiry, any CVC)"
echo ""
echo "─────────────────────────────────────────────────────"
echo ""

npm run dev
