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

- Node.js ≥ 22.12
- Bun ≥ 1.3 (package manager; the service itself runs on Node.js)

### Installation

1. Install dependencies:

   ```bash
   bun install
   ```

2. Start the service:

   ```bash
   bun run start
   ```

3. Build for production:
   ```bash
   bun run build
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

- `bun run start` - Start the server
- `bun run build` - Build for production
- `bun run dev` - Start with hot reload
- `bun run lint` - Run linter

## Running with Frontend

1. Start this service:

   ```bash
   bun run start
   ```

2. In a separate terminal, start the frontend:
   ```bash
   cd ../frontend
   bun run dev
   ```

The service runs on http://localhost:8082

## Customization

The `data.ts` file contains hardcoded configuration values. Modify it to:

- Set your Skip service URL
- Configure your reactive resources
- Define your message types

## License

MIT
