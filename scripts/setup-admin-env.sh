#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# ADMIN ENVIRONMENT VARIABLES SETUP SCRIPT
# ═══════════════════════════════════════════════════════════════
# This script helps you add admin environment variables to .env
# ═══════════════════════════════════════════════════════════════

ENV_FILE=".env"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║        ADMIN ENVIRONMENT VARIABLES SETUP                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env file not found. Creating it..."
    touch "$ENV_FILE"
fi

# Generate session secret
SESSION_SECRET=$(openssl rand -base64 32)

echo "📝 Please provide the following information:"
echo ""
read -p "Google OAuth Client ID: " CLIENT_ID
read -p "Google OAuth Client Secret: " CLIENT_SECRET

# Default values
REDIRECT_URI="http://localhost:3000/admin/auth/callback"
SESSION_MAX_AGE="1800000"

echo ""
echo "📋 Adding to .env file..."
echo ""

# Check if admin variables already exist
if grep -q "ADMIN_GOOGLE_CLIENT_ID" "$ENV_FILE"; then
    echo "⚠️  Admin variables already exist in .env"
    echo "   Please update them manually or remove them first."
    exit 1
fi

# Add admin variables to .env
cat >> "$ENV_FILE" << EOF

# ═══════════════════════════════════════════════════════════════
# ADMIN GOOGLE OAUTH CONFIGURATION
# ═══════════════════════════════════════════════════════════════
ADMIN_GOOGLE_CLIENT_ID=$CLIENT_ID
ADMIN_GOOGLE_CLIENT_SECRET=$CLIENT_SECRET
ADMIN_GOOGLE_REDIRECT_URI=$REDIRECT_URI

# Admin Session Settings
ADMIN_SESSION_SECRET=$SESSION_SECRET
ADMIN_SESSION_MAX_AGE=$SESSION_MAX_AGE
EOF

echo "✅ Admin environment variables added to .env"
echo ""
echo "📝 Summary:"
echo "   Client ID: $CLIENT_ID"
echo "   Redirect URI: $REDIRECT_URI"
echo "   Session Secret: Generated (hidden)"
echo ""
echo "🎉 Setup complete! Next steps:"
echo "   1. Run: node scripts/setup-first-admin.js"
echo "   2. Visit: http://localhost:3000/admin/login"
echo ""

