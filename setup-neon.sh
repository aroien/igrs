#!/bin/bash

echo "🚀 IGRS Platform - Vercel + Neon Setup"
echo "======================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set!"
    echo ""
    echo "Please create a .env file with your Neon connection string:"
    echo "DATABASE_URL=\"postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require\""
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate
echo ""

# Push database schema
echo "📊 Pushing database schema to Neon..."
npx prisma db push --accept-data-loss
echo ""

# Seed database
echo "🌱 Seeding database with initial data..."
npx prisma db seed
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start development server"
echo "2. Run 'vercel' to deploy to production"
echo ""
