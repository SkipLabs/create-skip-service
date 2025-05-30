# Skip Chat Reactive Service

The backend service for the Skip Chat template, demonstrating Skip's reactive streaming capabilities.

## Overview

This service provides:

- Real-time message streaming
- REST API endpoints for chat operations
- Skip reactive resource management
- Express.js server with TypeScript

## Features

- ⚡ Reactive message streaming
- 🔄 Real-time updates
- 🔒 Type-safe with TypeScript
- 🚀 Express.js server
- 📡 CORS enabled

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8

### Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the service:

   ```bash
   pnpm start
   ```

3. Build for production:
   ```bash
   pnpm build
   ```

## Project Structure

```
reactive_service/
├── src/
│   ├── index.ts        # Express server setup
│   ├── skipservice.ts  # Skip service configuration
│   └── data.ts         # Configuration
├── dist/              # Compiled output
└── package.json
```

## API Endpoints

- `GET /messages/:cid` - Stream messages for a conversation
- `PUT /messages/:id` - Update a message

## Development

Available commands:

- `pnpm start` - Start the server
- `pnpm build` - Build for production
- `pnpm dev` - Start with hot reload
- `pnpm lint` - Run linter

## Running with Frontend

1. Start this service:

   ```bash
   pnpm start
   ```

2. In a separate terminal, start the frontend:
   ```bash
   cd ../frontend
   pnpm dev
   ```

The service runs on http://localhost:8082

## Customization

The `data.ts` file contains hardcoded configuration values. Modify it to:

- Set your Skip service URL
- Configure your reactive resources
- Define your message types

## License

MIT
