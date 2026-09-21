# Skip Chat

A real-time chat application demonstrating Skip's reactive framework capabilities. Built with React, TypeScript, and Vite.

## Features

- ⚡ Real-time message streaming with Skip
- 🎨 Modern, responsive design
- 👥 Multi-user support with color coding
- 📱 Mobile-friendly interface

## Getting Started

### Prerequisites

- Node.js ≥ 22.12
- Bun ≥ 1.3 (package manager)

### Installation

1. Install dependencies:

   ```bash
   bun install
   ```

2. Start development:

   ```bash
   bun run dev
   ```

3. Build for production:
   ```bash
   bun run build
   ```

## Project Overview

```
frontend/
├── src/
│   ├── components/     # UI components
│   │   ├── chat/      # Chat components (message list, input, ...)
│   │   ├── Chat.tsx   # Chat page
│   │   └── InfoPanel.tsx
│   ├── api/           # Streaming hooks (useStream, usePostMessage) and types
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

- `bun run dev` - Start dev server
- `bun run build` - Build for production
- `bun run preview` - Preview build
- `bun run lint` - Run linter
- `bun run start` - Serve the production build (`vite preview --host`)

## Running the Application

1. Start the Skip service:

   ```bash
   cd ../reactive_service
   bun run start
   ```

2. Start the frontend:
   ```bash
   cd frontend
   bun run dev
   ```

Visit http://localhost:5173 to see the application.

## Customization

The `data.ts` file contains hardcoded configuration values. Modify it to fit your needs.

## License

MIT
