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

bun install
bun run build
bun run start
```

## Features

- **Real-time Streaming**: Built-in support for Skip's reactive data system
- **Reactive Programming**: Automatic data dependency tracking and updates
- **TypeScript Support**: Full TypeScript setup with proper configuration
- **Fastify API**: High-performance REST endpoints for social network simulation
- **Development Tools**: Includes formatting, building, and cleaning scripts

## Available Scripts

In the project directory, you can run:

- `bun run build` - Builds the service for production
- `bun run start` - Runs the built service
- `bun run clean` - Cleans build artifacts and dependencies
- `bun run format` - Formats code using Prettier
- `bun run lint` - Lints the source with ESLint

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

### REST API (port 8082, `src/index.ts`)

- `GET /active_friends/:uid` - Stream the active friends of a user
- `PUT /users/:uid` - Create or replace a user (name, active status, friends)
- `PUT /groups/:gid` - Create or replace a group

### Skip control API (port 8081)

- `PATCH /v1/inputs/users` - Write directly to the `users` input collection

## Development

### Prerequisites

- Node.js ≥ 22.12 (Latest LTS recommended)
- Bun ≥ 1.3 (package manager; the service itself runs on Node.js)

### Service Ports

The service runs on the following ports:

- Skip control service: 8081
- Skip streaming service: 8080
- REST API: 8082

### Example Usage

1. Start the service:

```bash
bun run start
```

2. Listen to a user's active friends:

```bash
curl -LN http://localhost:8082/active_friends/1
```

3. Update user data through the REST API:

```bash
curl -X PUT http://localhost:8082/users/1 \
  --json '{"name": "Alice", "active": true, "friends": [0, 2, 3]}'
```

or directly through the Skip control API:

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

This template is licensed under the MIT License.
