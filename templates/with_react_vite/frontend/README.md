# Skip Chat

A real-time chat application demonstrating Skip's reactive framework capabilities. Built with React, TypeScript, and Vite.

## Features

- ⚡ Real-time message streaming with Skip
- 🎨 Modern, responsive design
- 👥 Multi-user support with color coding
- 📱 Mobile-friendly interface

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8

### Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start development:

   ```bash
   pnpm dev
   ```

3. Build for production:
   ```bash
   pnpm build
   ```

## Project Overview

```
frontend/
├── src/
│   ├── components/     # UI components
│   │   ├── chat/      # Chat components
│   │   └── InfoPanel.tsx
│   ├── services/      # API services
│   ├── data.ts        # Configuration
│   └── App.tsx        # Root component
└── index.html
```

## Tech Stack

- [Vite](https://vitejs.dev/) - Build tool
- [React](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Skip](https://skiplabs.io) - Reactive framework

## Development

Available commands:

- `pnpm dev` - Start dev server
- `pnpm build` - Build for production
- `pnpm preview` - Preview build
- `pnpm lint` - Run linter

## Running the Application

1. Start the Skip service:

   ```bash
   cd ../reactive_service
   pnpm start
   ```

2. Start the frontend:
   ```bash
   cd frontend
   pnpm dev
   ```

Visit http://localhost:5173 to see the application.

## Customization

The `data.ts` file contains hardcoded configuration values. Modify it to fit your needs.

## License

MIT
