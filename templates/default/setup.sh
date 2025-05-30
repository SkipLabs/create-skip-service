#!/bin/bash

echo "🚀 Setting up Skip Chat projects..."

# Install and build reactive service
echo "📦 Installing dependencies..."
pnpm install
echo "🔨 Building..."
pnpm build

echo "✅ Setup complete!"
echo ""
echo "To run the application:"  
echo "   pnpm start"
echo ""