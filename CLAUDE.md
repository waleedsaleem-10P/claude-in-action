# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Lint (auto-fix)
npm run lint

# Format
npm run format

# Unit tests
npm run test

# Run a single test file
npx jest src/app.controller.spec.ts

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Architecture

This is a standard NestJS v11 starter application using TypeScript.

- **Entry point**: `src/main.ts` — bootstraps the app on `PORT` env var or 3000
- **Module system**: NestJS uses `@Module` decorators to wire controllers and providers. `AppModule` is the root module.
- **Controllers** handle HTTP routing via decorators (`@Get`, `@Post`, etc.)
- **Services** (`@Injectable`) contain business logic and are injected into controllers via constructor DI
- Unit tests live alongside source files as `*.spec.ts`; E2E tests are in `test/` with their own Jest config (`test/jest-e2e.json`)

When adding features, follow the NestJS pattern: generate a module/controller/service with `nest g module|controller|service <name>` and import the new module into `AppModule`.

## Code Style

- Use comments sparingly. Only add comments where the logic is not self-evident.
- Always use underscore with primary ids of database
