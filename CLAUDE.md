# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Recipe web application - a hybrid Angular 18 / AngularJS 1.8 app being migrated from AngularJS to modern Angular. The app stores and manages recipes with features for viewing, creating, editing, and organizing recipes into recipe books.

## Architecture

**Hybrid Setup**: Uses `@angular/upgrade/static` to run both frameworks simultaneously:
- Angular 18 bootstraps first, then bootstraps AngularJS within it (`src/app/app.module.ts`)
- Angular services/components are downgraded for AngularJS consumption
- AngularJS routing (`ngRoute`) handles most navigation; Angular handles the shell

**Directory Structure**:
- `src/` - Modern Angular code (TypeScript)
  - `src/app/core/services/` - Angular services (RecipeService, UserService, RecipeBookService)
  - `src/app/shared/components/` - Shared Angular components (NavbarComponent)
- `app/recipe-lib/` - AngularJS code (JavaScript)
  - Feature folders: `home/`, `recipe/`, `view-recipe/`, `new-recipe/`, `search/`, `recipe-book/`, `navbar/`
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

# Tests - AngularJS unit tests (Karma)
npm test                  # Run with Chrome, watch mode
npm run test-single-run   # Single run
npm run test-headless     # Headless single run

# Tests - Angular unit tests
npm run test:ng           # Karma with Angular CLI

# E2E tests (Protractor) - requires backend service on port 5555
npm run protractor        # All e2e specs
npm run single-file-e2e   # Run login-spec.js only (starts test servers first)

# Cypress E2E
npm run cypress           # Open Cypress UI
npm run cypress:headless  # Headless run

# Linting
npm run lint              # JSHint for AngularJS code
```

## Testing Details

- **AngularJS tests**: Use Karma + Jasmine, located in `app/recipe-lib/**/*.spec.js`
- **Angular tests**: Use Karma + Jasmine via Angular CLI, located in `src/app/**/*.spec.ts`
- **E2E tests**: Protractor specs in `e2e-tests/`, Cypress in `cypress/`
- Test helpers: `app/recipe-lib/spec-utils.spec.js` provides common test utilities

## Backend Dependencies

The Express server (`node-app.js`) proxies API requests to a separate backend service expected at `http://127.0.0.1:5555/api`. Environment variable `SERVICE_IP` overrides the backend host.

## Development Practices

- **TDD Required**: Write unit tests before implementing new functionality
- **Unit Test Coverage**: All new Angular components, services, and directives must have corresponding `.spec.ts` files with full test coverage
- **E2E Tests**: Protractor tests must pass after every change - run `npm run protractor` before committing

## Migration Strategy

**Preferred Approach: Bottom-Up Component Replacement**

Migrate leaf components first, then work up to full pages:

1. **Downgrade Angular component** for AngularJS use via `downgradeComponent()` in `app.module.ts`
2. **Update ONE AngularJS template** to use the new Angular component
3. **Run E2E tests** to verify nothing broke
4. **Repeat** for other templates using that component
5. **Once all leaf components are migrated**, migrate full pages by adding Angular routes

This approach ensures small, incremental changes with passing tests at every step.

## Key Patterns

- User authentication via Google OAuth or local login (email/IP-based)
- `RequestingUser` header added to API requests for user context
- AngularJS uses `$routeProvider` with hash-based routing (`#/home`, `#/recipe/:id`)
- Angular services are injected into AngularJS via `downgradeInjectable()`
