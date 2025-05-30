# Skip React + Vite Template

This template provides a starting point for building full-stack Skip applications with React and Vite. It includes a complete setup for real-time data streaming, reactive programming, and a modern frontend development experience.

## What's Included

- Skip service setup with reactive data system
- React + Vite frontend with TypeScript
- Real-time data streaming capabilities
- RESTful API endpoints for chat functionality
- Development scripts and utilities
- Hot Module Replacement (HMR) for frontend

## Quick Start

```bash
# Create a new Skip service using this template
npx create-skip-service my-service --template with_react_vite

# Navigate to your project
cd my-service

# Set up the project
./setup.sh
```

## Features

- **Real-time Streaming**: Built-in support for Skip's reactive data system
- **Modern Frontend**: React 18 with Vite for lightning-fast development
- **TypeScript Support**: Full TypeScript setup across frontend and backend
- **API Endpoints**: Pre-configured REST endpoints for chat functionality
- **Development Tools**: Includes formatting, building, and cleaning scripts
- **Hot Module Replacement**: Instant feedback during frontend development

## Available Scripts

In the project directory, you can run:

### Backend (reactive_service)
- `pnpm build` - Builds the service for production
- `pnpm start` - Runs the built service
- `pnpm clean` - Cleans build artifacts and dependencies

### Frontend (frontend)
- `pnpm dev` - Starts the development server
- `pnpm build` - Builds the frontend for production
- `pnpm preview` - Previews the production build
- `pnpm clean` - Cleans build artifacts and dependencies

## Project Structure

```bash
.
├── frontend/           # React + Vite frontend application
│   ├── src/
│   │   ├── App.tsx    # Main application component
│   │   ├── main.tsx   # Application entry point
│   │   └── ...
│   └── ...
└── reactive_service/   # Skip reactive service
    ├── src/
    │   ├── index.ts   # Express server exposing API
    │   ├── skipservice.mts  # Skip service and reactive graph
    │   └── ...
    └── ...
```

## API Structure

The template includes the following API endpoints:

### Chat

- `GET /messages` - Get all messages
- `POST /messages` - Send a new message
- `GET /streams/messages` - Get a stream of all messages

## Development

### Prerequisites

- Node.js (Latest LTS version)
- pnpm package manager

### Service Ports

The services run on the following ports:
- Skip control service: 8081
- Skip streaming service: 8080
- REST API: 8082
- Frontend development server: 5173

### Running the Application

1. Start the reactive service:
```bash
cd reactive_service && pnpm start
```

2. In a new terminal, start the frontend:
```bash
cd frontend && pnpm dev
```

The frontend will be available at http://localhost:5173

## Learn More

To learn more about Skip and its features:

- [Skip Documentation](https://skiplabs.io/docs/)
- [Skip GitHub Repository](https://github.com/skiplabs/skip)
- [Building a Real-time Blog with Skip and PostgreSQL](https://skiplabs.io/blog/postgresql_and_skip)

## License

This template is licensed under the ISC License.
