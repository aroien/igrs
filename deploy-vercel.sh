#!/bin/bash

echo "🚀 Quick Vercel Deployment"
echo "=========================="
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
    echo ""
fi

echo "🔐 Logging into Vercel..."
vercel login
echo ""

echo "🚀 Deploying to Vercel..."
vercel --prod
echo ""

echo "✅ Deployment complete!"
echo ""
echo "Don't forget to add DATABASE_URL in Vercel dashboard:"
echo "1. Go to your project settings"
echo "2. Environment Variables"
echo "3. Add DATABASE_URL with your Neon connection string"
echo ""
