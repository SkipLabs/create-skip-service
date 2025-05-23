# create-skip-service

A CLI tool to bootstrap Skip services with various templates. It provides a quick way to start new Skip projects with pre-configured templates for different use cases.

## Usage

To create a new Skip service, run:

```bash
npx create-skip-service <project-name> <options>
```

## Available Templates

Templates can be found [here](https://github.com/SkipLabs/create-skip-service/tree/main/templates).  

### with-postgres

A template that includes:

- PostgreSQL database integration
- Basic service structure
- TypeScript configuration
- Development tools setup

## Development

To work on this tool locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build the project:
   ```bash
   pnpm build
   ```
4. Run in development mode:
   ```bash
   pnpm dev
   ```

## Scripts

- `pnpm build` - Build the project
- `pnpm start` - Run the CLI
- `pnpm dev` - Run in development mode with watch
- `pnpm clean` - Clean build artifacts
- `pnpm format` - Format code with Prettier

## Support

Join the [Discord](https://discord.gg/ss4zxfgUBH) to talk to other community members and developers or ask any questions.
