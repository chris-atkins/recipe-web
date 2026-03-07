# CLAUDE.md - Recipe Web (Frontend)

## Stack
- Angular 18.2, TypeScript 5.4, RxJS 7.8
- Bootstrap 4 + Font Awesome 4.7
- Express BFF (`node-app.js`) proxies `/api` to backend at port 5555
- Rich text: ngx-quill + Quill 2.0
- Image cropping: ngx-image-cropper

## Commands
```bash
# Install
npm install

# Development (both servers)
npm run start:all    # Express (port 8000) + Angular dev server (port 4200)

# Individual servers
npm start            # Express only (port 8000, serves dist/)
npm run start:ng     # Angular dev server only (port 4200, proxies to 8000)

# Build
npm run build        # Development build
npm run build:prod   # Production build

# Tests
npm test             # Karma + Chrome, watch mode
npm run test:headless  # Headless Chrome, single run (use before commits)

# E2E
npm run cypress           # Cypress UI
npm run cypress:headless  # Cypress headless

# Lint
npm run lint         # JSHint for E2E files
```

## Architecture

### Directory Structure
```
src/app/
  core/
    services/         # RecipeService, UserService, RecipeBookService, ExternalNavigationService
    interceptors/     # UserHeaderInterceptor (adds RequestingUser header)
  features/
    home/             # Landing page
    search/           # Recipe search + card wall
    view-recipe/      # View/edit single recipe
    new-recipe/       # Create recipe with rich text editor
    recipe-book/      # User's saved recipes
  shared/
    components/       # Navbar, RecipeElement, RecipeCardWall, ImageUpload, ImageUploadModal
    directives/       # AutoFocusDirective
```

### Routing
- Hash-based routing: `useHash: true` in `AppRoutingModule`
- Routes: `/home`, `/search-recipes`, `/view-recipe/:recipeId`, `/new-recipe`, `/user/:userId/recipe-book`
- Defined in `app-routing.module.ts`

### Key Patterns

**Services**: HttpClient-based, return Promises (via `firstValueFrom`). Located in `core/services/`.

**Auth**: `UserService` manages auth state via `BehaviorSubject`. Cookie `myrecipeconnection.com.usersLoggedInFromThisBrowser` for persistence. Google OAuth + local email login.

**RequestingUser Header**: `UserHeaderInterceptor` in `core/interceptors/` adds the header to all HTTP requests automatically.

**Express BFF**: `node-app.js` handles auth (Passport Google OAuth, local login), proxies `/api/*` to `http://{SERVICE_IP}:5555/api`, serves Angular dist. Env vars: `SERVICE_IP`, `PORT`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

### Models
```typescript
User { userId, userName, userEmail }
Recipe { recipeId?, recipeName, recipeContent, imageUrl?, image?, editable? }
RecipeBookItem { recipeId }
```

## Testing

### Framework
- Karma + Jasmine + Angular TestBed
- Spec files: `src/app/**/*.spec.ts`
- Config: `karma-angular.conf.js`
- Coverage: karma-coverage outputs to `./coverage/recipe-web/` (HTML + text-summary)

### Test Patterns

**Services**: Use `HttpClientTestingModule` + `HttpTestingController`. Verify HTTP method, URL, request body. Flush mock responses. Call `httpMock.verify()` in `afterEach`.

**Components**: Use `TestBed.configureTestingModule()` with mock services via `jasmine.createSpyObj()`. Test behavior, template rendering, event handling.

**Auth-dependent tests**: Use `BehaviorSubject` to control UserService state.

### Test Style
- Nested `describe` blocks for method grouping
- `it('descriptive behavior statement', ...)`
- `beforeEach` for TestBed setup, `afterEach` for verification/cleanup
- Async: `done` callback or `fakeAsync`/`tick`
- Edge cases: error responses, null/undefined inputs, empty arrays, unauthorized state

### Coverage
- Run `npm run test:headless` — report generates to `./coverage/recipe-web/`
- After test runs, record coverage in `/test-coverage.md` at project root
- Coverage must never decrease from last recorded baseline

### Adding a New Feature
1. Write `.spec.ts` test file FIRST (TDD)
2. Create component/service in proper directory (`features/`, `core/services/`, `shared/`)
3. Add route in `app-routing.module.ts` if needed
4. Register in `app.module.ts` (declarations or imports)
5. If calling new API endpoint, update corresponding service in `core/services/`
6. Run `npm run test:headless` — all tests pass, coverage maintained

## Backend Dependencies
The Express server proxies API requests to a separate backend service at `http://127.0.0.1:5555/api`. The backend must be running for full functionality. Environment variable `SERVICE_IP` overrides the backend host.
