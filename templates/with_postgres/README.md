# Skip Postgres Template

This template provides a starting point for building Skip services with PostgreSQL integration. It includes a complete setup for real-time data streaming and persistence.

## What's Included

- Skip service setup with PostgreSQL integration
- Real-time data streaming capabilities
- RESTful API endpoints for post management
- Docker configuration for PostgreSQL
- TypeScript configuration
- Development scripts and utilities

## Quick Start

```bash
# Create a new Skip service using this template
npx create-skip-service my-service --template with_postgres

# Navigate to your project
cd my-service

# Initialize the development server
./init_server.sh
```

## Features

- **Real-time Streaming**: Built-in support for Skip's reactive data system
- **PostgreSQL Integration**: Ready-to-use database configuration
- **TypeScript Support**: Full TypeScript setup with proper configuration
- **API Endpoints**: Pre-configured REST endpoints for common operations
- **Development Tools**: Includes formatting, building, and cleaning scripts

## Available Scripts

In the project directory, you can run:

- `pnpm build` - Builds the service for production
- `pnpm start` - Runs the built service
- `pnpm clean` - Cleans build artifacts and dependencies
- `pnpm format` - Formats code using Prettier
- `pnpm client` - Runs the example client

## API Structure

The template includes the following API endpoints:

### Posts

- `GET /posts/:id` - Get a specific post
- `POST /posts` - Create a new post
- `PATCH /posts/:id/publish` - Publish a post
- `PATCH /posts/:id/unpublish` - Unpublish a post
- `DELETE /posts/:id` - Delete a post

### Users

- `GET /users` - List all users
- `GET /users/:id` - Get a specific user

### Streaming

- `GET /streams/posts` - Get a stream of all posts
- `GET /streams/posts/:uid` - Get a stream for a specific post

## Development

### Prerequisites

- Node.js (Latest LTS version)
- pnpm package manager
- Docker (for PostgreSQL)

### Clean Up

To clean up the development environment:

```bash
pnpm clean
docker stop skip-demo-postgres && docker rm skip-demo-postgres
```

## Learn More

To learn more about Skip and its features:

- [Skip Documentation](https://skiplabs.io/docs/)
- [Skip GitHub Repository](https://github.com/skiplabs/skip)

## License

This template is licensed under the ISC License.
