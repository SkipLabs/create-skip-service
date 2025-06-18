# Skip Default Template

This template provides a starting point for building reactive Skip services. It includes a complete setup for real-time data streaming and reactive programming using Skip's powerful reactive data system.

## What's Included

- Skip service setup with reactive data system
- Real-time data streaming capabilities
- Fastify-based RESTful API endpoints for social network simulation
- TypeScript configuration
- Development scripts and utilities

## Quick Start

```bash
# Create a new Skip service using this default template
npx create-skip-service my-service

cd my-service

pnpm install
pnpm build
pnpm start
```

## Features

- **Real-time Streaming**: Built-in support for Skip's reactive data system
- **Reactive Programming**: Automatic data dependency tracking and updates
- **TypeScript Support**: Full TypeScript setup with proper configuration
- **Fastify API**: High-performance REST endpoints for social network simulation
- **Development Tools**: Includes formatting, building, and cleaning scripts

## Available Scripts

In the project directory, you can run:

- `pnpm build` - Builds the service for production
- `pnpm start` - Runs the built service
- `pnpm clean` - Cleans build artifacts and dependencies
- `pnpm format` - Formats code using Prettier

## Project Structure

```bash
src/
├── activefriends.mts   # Mappers & resources to track active friends
├── data.mts            # Initial user and group data
├── index.ts            # Fastify server exposing API
├── skipservice.mts     # Skip service and reactive graph
└── types.mts           # Type definitions and Skip interfaces
```

## API Structure

The template includes the following API endpoints:

### Active Friends

- `GET /active_friends/:id` - Get active friends for a specific user

### Users

- `PATCH /v1/inputs/users` - Update user data (including active status and friends)

## Development

### Prerequisites

- Node.js (Latest LTS version)
- pnpm package manager

### Service Ports

The service runs on the following ports:

- Skip control service: 8081
- Skip streaming service: 8080
- REST API: 8082

### Example Usage

1. Start the service:

```bash
pnpm start
```

2. Listen to a user's active friends:

```bash
curl -LN http://localhost:8082/active_friends/1
```

3. Update user data:

```bash
curl http://localhost:8081/v1/inputs/users \
  -X PATCH \
  --json '[[1, [
    {
      "name": "Alice",
      "active": true,
      "friends": [0, 2, 3]
    }
  ]]]'
```

## Learn More

To learn more about Skip and its features:

- [Skip Documentation](https://skiplabs.io/docs/)
- [Skip GitHub Repository](https://github.com/skiplabs/skip)

## License

This template is licensed under the ISC License.
