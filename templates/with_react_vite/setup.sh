#!/bin/bash

echo "🚀 Setting up Skip Chat projects..."

# Install and build reactive service
echo "📦 Installing reactive service dependencies..."
cd reactive_service
pnpm install
echo "🔨 Building reactive service..."
pnpm build
cd ..

# Install and build frontend
echo "📦 Installing frontend dependencies..."
cd frontend
pnpm install
echo "🔨 Building frontend..."
pnpm build
cd ..

echo "✅ Setup complete!"
echo ""
echo "To run the application:"
echo "1. Start the reactive service:"
echo "   cd reactive_service && pnpm start"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend && pnpm dev"
echo ""
echo "The frontend will be available at http://localhost:5173" 