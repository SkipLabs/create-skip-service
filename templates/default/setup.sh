#!/bin/bash

echo "🚀 Setting up Skip Chat projects..."

# Install and build reactive service
echo "📦 Installing dependencies..."
bun install
echo "🔨 Building..."
bun run build

echo "✅ Setup complete!"
echo ""
echo "To run the application:"  
echo "   bun run start"
echo ""