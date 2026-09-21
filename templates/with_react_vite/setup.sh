#!/bin/bash

echo "🚀 Setting up Skip Chat projects..."

# Install and build reactive service
echo "📦 Installing reactive service dependencies..."
cd reactive_service
bun install
echo "🔨 Building reactive service..."
bun run build
cd ..

# Install and build frontend
echo "📦 Installing frontend dependencies..."
cd frontend
bun install
echo "🔨 Building frontend..."
bun run build
cd ..

echo "✅ Setup complete!"
echo ""
echo "To run the application:"
echo "1. Start the reactive service:"
echo "   cd reactive_service && bun run start"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend && bun run dev"
echo ""
echo "The frontend will be available at http://localhost:5173" 