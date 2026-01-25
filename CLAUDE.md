# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Recipe web application - a modern Angular 18 app. The app stores and manages recipes with features for viewing, creating, editing, and organizing recipes into recipe books.

## Architecture

**Directory Structure**:
- `src/` - Angular code (TypeScript)
  - `src/app/core/services/` - Angular services (RecipeService, UserService, RecipeBookService)
  - `src/app/shared/components/` - Shared Angular components (NavbarComponent, RecipeElement, etc.)
  - `src/app/features/` - Feature modules (home, search, view-recipe, new-recipe, recipe-book)
  - `src/assets/images/` - Static images
  - `src/styles/` - Global stylesheets
- `e2e-tests/` - Protractor E2E tests
- `node-app.js` - Express backend proxy server (proxies API calls to `http://127.0.0.1:5555/api`)

**Build Output**: `dist/recipe-web/` - served by the Express server

## Common Commands

```bash
# Install dependencies
npm install

# Development - run both servers concurrently
npm run start:all         # Runs Express (port 8000) + Angular dev server (port 4200)

# Or run separately:
npm start                 # Express backend only (port 8000, serves dist/)
npm run start:ng          # Angular dev server only (port 4200, proxies API to 8000)

# Build
npm run build             # Development build
npm run build:prod        # Production build

# Unit tests
npm test                  # Run with Chrome, watch mode
npm run test:watch        # Run with Chrome, watch mode
npm run test:headless     # Headless single run

# E2E tests (Protractor) - requires backend service on port 5555
npm run protractor        # All e2e specs

# Cypress E2E
npm run cypress           # Open Cypress UI
npm run cypress:headless  # Headless run

# Linting
npm run lint              # JSHint for E2E test files

# All tests
npm run allTests          # Lint + headless unit tests + protractor
```

## Testing Details

- **Unit tests**: Use Karma + Jasmine via Angular CLI, located in `src/app/**/*.spec.ts`
- **E2E tests**: Protractor specs in `e2e-tests/`, Cypress in `cypress/`

## Backend Dependencies

The Express server (`node-app.js`) proxies API requests to a separate backend service expected at `http://127.0.0.1:5555/api`. Environment variable `SERVICE_IP` overrides the backend host.

## Development Practices

- **TDD Required**: Write unit tests before implementing new functionality
- **Unit Test Coverage**: All new Angular components, services, and directives must have corresponding `.spec.ts` files with full test coverage
- **E2E Tests**: Protractor tests must pass after every change - run `npm run protractor` before committing

## Key Patterns

- User authentication via Google OAuth or local login (email/IP-based)
- `RequestingUser` header added to API requests for user context
- Angular uses hash-based routing (`#/home`, `#/view-recipe/:id`)
- Rich text editing via ngx-quill
