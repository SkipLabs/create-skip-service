# Skip Service Templates

This directory contains templates for creating Skip services. Each template provides a different starting point with specific features and configurations.

## Available Templates

### Default Template (`default`)

A basic Skip service template that demonstrates reactive programming with Skip. Perfect for learning and simple use cases.

```bash
npx create-skip-service my-service
# or explicitly
npx create-skip-service my-service --template default
```

Features:

- Reactive data system setup
- Real-time data streaming
- Basic social network simulation
- TypeScript configuration
- Development scripts

### PostgreSQL Template (`with_postgres`)

A production-ready template with PostgreSQL integration for data persistence.

```bash
npx create-skip-service my-service --template with_postgres
```

Features:

- PostgreSQL database integration
- Real-time data streaming
- RESTful API endpoints
- Docker configuration
- TypeScript setup

### React + Vite Template (`with_react_vite`)

A Chat application in the browser for a working end-to-end skip integration with React + Vite.

```bash
npx create-skip-service my-service --template with_react_vite
```

Features:

- React + Vite basic Chat app
- Real-time data streaming
- Streaming API endpoints
- Typescript setup

## Using Templates

1. Choose a template based on your needs
2. Create a new service using the template:
   ```bash
   npx create-skip-service my-service --template <template-name>
   ```
3. Follow the template-specific README for setup instructions

## Template Structure

Each template includes:

- Complete project setup
- TypeScript configuration
- Development scripts
- Documentation
- Example code

## Contributing

We welcome new templates! To contribute:

1. Create a new directory in `templates/`
2. Include all necessary files
3. Add a comprehensive README.md
4. Submit a pull request

## Learn More

- [Skip Documentation](https://skiplabs.io/docs/)
- [Skip GitHub Repository](https://github.com/skiplabs/skip)
