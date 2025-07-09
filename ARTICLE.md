---
title: A CLI to streamline the creation of Skip services
description: A CLI designed to streamline the creation and initialization of Skip services
slug: announcing_create_skip_service_cli
date: 2025-06-26
authors: hubyrod
---

Hello Skippers. We're excited to share `create-skip-service`: A CLI Tool for Skip Service Development. This tool simplifies the development workflow by providing a convenient way to bootstrap new Skip services with best practices built in.

```bash
npx create-skip-service <project-name> <options>
```

{/_ truncate _/}

## What is create-skip-service?

`create-skip-service` is a CLI tool that helps developers quickly set up new Skip service projects with customizable templates, eliminating the need to write boilerplate code from scratch. It follows established best practices and provides a consistent starting point for Skip service development.

## Key Features

- **Quick Project Setup**: Get a fully working service with a single command
- **Template System**: Choose from multiple templates designed for different use cases
- **Git Integration**: Automatic Git repository initialization with initial commit (optional)
- **Customizable**: Templates serve as starting points - customize them for your specific needs
- **Comprehensive Logging**: Detailed output options for debugging and understanding the setup process

## Getting Started

[KISS](https://en.wikipedia.org/wiki/KISS_principle) - here is the one-liner to get started:

```bash
npx create-skip-service my-service
```

### Usage Examples

Since every project has different requirements, here are various ways to use the tool:

```bash
# Create a new service with default template
npx create-skip-service my-service

# Create a service with PostgreSQL integration
npx create-skip-service my-service --template with_postgres

# Create a service with React + Vite frontend
npx create-skip-service my-service --template with_react_vite

# Create a service without Git initialization
npx create-skip-service my-service --no-git-init

# Run with verbose logging
npx create-skip-service my-service --verbose
```

## Available Options

- `--template, -t`: Specify the template to use (default: "default")
- `--example, -e`: Use an example from SkipLabs/skip repository instead of a template
- `--no-git-init`: Skip Git repository initialization
- `--verbose, -v`: Enable detailed logging output
- `--quiet, -q`: Minimize logging output
- `--force, -f`: Overwrite existing directory if it exists

## Available Templates

- **default**: Basic reactive Skip service
- **with_postgres**: Skip service with PostgreSQL integration
- **with_react_vite**: Chat application with React + Vite frontend

## Why use create-skip-service?

This tool addresses key challenges in Skip service development:

1. **Efficiency**: Dramatically reduce time spent on project setup and configuration
2. **Best Practices**: Ensures new projects follow established patterns and conventions
3. **Flexibility**: Multiple templates support different architectural needs while maintaining consistency
4. **Developer Experience**: Comprehensive error handling and automatic cleanup on failures

## Contributing

We welcome contributions to `create-skip-service`! Whether it's bug reports, feature requests, or code contributions, your input helps make this tool better for everyone.

- GitHub Repository: [SkipLabs/create-skip-service](https://github.com/SkipLabs/create-skip-service)
- Issues: [GitHub Issues](https://github.com/SkipLabs/create-skip-service/issues)

## Examples Available

Beyond templates, you can also bootstrap from real-world examples:

- **blogger**: Full-stack blogging platform with leader-follower Skip service, Flask API, Vue.js frontend, and PostgreSQL
- **chatroom**: Real-time chat application with Skip service + Kafka, Express.js API, and React frontend
- **hackernews**: HackerNews clone with distributed Skip service, Flask API, React frontend, and PostgreSQL

```bash
# Use an example instead of a template
npx create-skip-service my-blog --example blogger
```

## Try It Out!

Ready to streamline your Skip service development? Start with:

```bash
npx create-skip-service my-service
```

## Wrapping Up

`create-skip-service` makes Skip service development more efficient and enjoyable. By handling boilerplate setup automatically, it lets developers focus on building great services rather than configuration.

The tool includes comprehensive error handling, automatic cleanup on failures, and supports both templates for common patterns and examples for learning from real-world applications.

Join our [Discord server](https://discord.com/channels/1093901946441703434/1093901946441703437) to share what you're building and get help from the community!

## What's Next?

Which Skip topic would be most valuable for your current projects?

- Scaling Skip services horizontally?
- Advanced frontend integration patterns?
- User authorization and privacy management?
- Real-time data synchronization strategies?

Let us know what you'd like to see covered next!
