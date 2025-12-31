# AngularJS 1.4 to Angular 18 Migration Plan

## Executive Summary

This document outlines a detailed, phased approach to migrate the Recipe Connection application from **AngularJS 1.4.14** to **Angular 18** using the **ngUpgrade hybrid approach** with **in-place migration**.

**Current State:**
- AngularJS 1.4.14 (2015)
- 21 JavaScript source files (~3,300 LOC)
- 14 controllers, 6 directives, 6 services
- No bundler (direct script tags)
- Bower for dependencies
- Karma/Jasmine/Protractor for testing

**Migration Strategy:** Incremental hybrid migration using `@angular/upgrade` with in-place file structure

**Estimated Timeline:** 20-26 weeks (5-6.5 months)

**Architecture Decision:** Using NgModule-based architecture (not standalone components) for better compatibility with ngUpgrade during hybrid phase. Can migrate to standalone components after completing migration.

---

## Phase 0: Preparation & Setup (Weeks 1-3)

### Objectives
- Modernize AngularJS to latest 1.x version
- Research critical dependencies (Trix editor)
- Add TypeScript support
- Set up modern build tooling
- Establish dual build system
- Audit jQuery usage

### Tasks

#### Week 1: AngularJS Modernization

**1.1 Upgrade AngularJS to 1.8.3 (latest)**
```bash
# Update bower.json
"angular": "1.8.3",
"angular-cookies": "1.8.3",
"angular-loader": "1.8.3",
"angular-mocks": "1.8.3",
"angular-route": "1.8.3"
```

**Critical:** This upgrade includes breaking changes:
- Replace `.success()` and `.error()` with `.then()` in all services
  - Files to update:
    - `app/recipe-lib/user/user.js` (lines 26-32, 38-45)
    - `app/recipe-lib/recipe-book/recipe-book-service.js` (all HTTP calls)
- Test thoroughly after upgrade

**1.2 Refactor Promise Handling**

Before (deprecated):
```javascript
$http.get('/api/user/' + userId)
  .success(function(data) { /* ... */ })
  .error(function(err) { /* ... */ });
```

After (standard):
```javascript
$http.get('/api/user/' + userId)
  .then(function(response) {
    return response.data;
  })
  .catch(function(err) { /* ... */ });
```

**Files to refactor:**
- `app/recipe-lib/user/user.js`
- `app/recipe-lib/recipe-book/recipe-book-service.js`

**1.3 Remove Manual Promise Creation**

Replace `$q.defer()` with direct promise returns:

Before:
```javascript
var deferred = $q.defer();
$http.get('/api/...').success(function(data) {
  deferred.resolve(data);
});
return deferred.promise;
```

After:
```javascript
return $http.get('/api/...')
  .then(function(response) {
    return response.data;
  });
```

#### Week 2: Dependency Research & jQuery Audit

**2.1 Research Trix Editor Replacement**

Current: `angular-trix` directive
Options to evaluate:

1. **Quill.js with ngx-quill** (Recommended)
   - Pros: Excellent Angular support, modern, actively maintained
   - Cons: Different API than Trix
   - npm: `ngx-quill`

2. **CKEditor 5**
   - Pros: Industry standard, feature-rich
   - Cons: Larger bundle size
   - npm: `@ckeditor/ckeditor5-angular`

3. **TinyMCE**
   - Pros: Feature-rich, good documentation
   - Cons: Larger bundle, some features require license
   - npm: `@tinymce/tinymce-angular`

**Action:** Test Quill.js in a spike branch to verify compatibility with recipe content format.

**Decision Point:** Choose editor by end of Week 2.

**2.2 Audit jQuery Usage**

Run audit:
```bash
grep -r "jquery\|jQuery\|\$\(|\$\." app/recipe-lib/ > jquery-usage.txt
```

Document all jQuery usage:
- DOM manipulation (`.hide()`, `.show()`, `.addClass()`)
- AJAX calls (`.ajax()`)
- Event handlers (`.click()`, `.on()`)
- Selectors

Create replacement plan:
```typescript
// jQuery: $('.class').hide()
// Angular: Use *ngIf in template

// jQuery: $('.class').addClass('active')
// Angular: [class.active]="condition" or Renderer2

// jQuery: $.ajax()
// Angular: HttpClient (already planned)

// jQuery: $('.element').on('click', handler)
// Angular: (click)="handler()" in template
```

**Deliverable:** `jquery-migration-plan.md` document

**2.3 Audit ng-file-upload Usage**

Document all file upload functionality:
- Image upload component location
- Upload API endpoints
- File size limits
- Accepted file types
- Error handling

#### Week 3: Build System Setup

**3.1 Install TypeScript and Angular Dependencies**

```bash
# TypeScript and types
npm install --save-dev typescript @types/angular @types/angular-route @types/angular-cookies

# Angular 18
npm install --save @angular/core@^18.0.0 \
  @angular/common@^18.0.0 \
  @angular/compiler@^18.0.0 \
  @angular/platform-browser@^18.0.0 \
  @angular/platform-browser-dynamic@^18.0.0 \
  @angular/router@^18.0.0 \
  @angular/forms@^18.0.0 \
  @angular/upgrade@^18.0.0 \
  rxjs@^7.8.0 \
  tslib@^2.6.0 \
  zone.js@^0.14.0
```

**3.2 Create Directory Structure**

Create `src/` alongside `app/` (in-place migration):
```bash
mkdir -p src/app/core/services
mkdir -p src/app/core/interceptors
mkdir -p src/app/shared/components
mkdir -p src/app/features/home
mkdir -p src/app/features/recipe
mkdir -p src/app/features/search
mkdir -p src/app/features/user
mkdir -p src/assets
mkdir -p src/environments
```

**3.3 Configure TypeScript**

Create `tsconfig.json`:
```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

Create `tsconfig.angularjs.json` for AngularJS code:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES5",
    "module": "commonjs",
    "allowJs": true,
    "checkJs": false,
    "strict": false,
    "outDir": "./dist-angularjs"
  },
  "include": ["app/recipe-lib/**/*"],
  "exclude": ["node_modules", "**/*.spec.js"]
}
```

**3.4 Install Angular CLI**
```bash
npm install --save-dev @angular/cli@latest
```

Create `angular.json`:
```bash
ng config --global cli.analytics false
# Manually create angular.json or use ng new in temp dir and copy config
```

**3.5 Migrate from Bower to npm**

Move all Bower dependencies to package.json:
```bash
npm install --save angular@1.8.3 angular-route angular-cookies \
  jquery@3.3.1 bootstrap@4.0.0 underscore \
  ng-file-upload angular-trix
```

Update `app/index.html` to reference npm packages instead of bower_components:
```html
<!-- Before -->
<script src="bower_components/angular/angular.js"></script>

<!-- After -->
<script src="node_modules/angular/angular.js"></script>
```

**3.6 Update node-app.js for Hybrid Serving**

Update `node-app.js` to serve from both directories during migration:
```javascript
// Add after existing static middleware
app.use(express.static(path.join(__dirname, 'app')));

// For Angular development (will be added in Phase 1)
// During hybrid phase, this will serve Angular CLI output
if (process.env.NODE_ENV !== 'production') {
  // Development: proxy to ng serve (will configure in Phase 1)
} else {
  // Production: serve from dist
  app.use(express.static(path.join(__dirname, 'dist/recipe-web')));
}
```

**3.7 Run All Tests**

Ensure everything still works:
```bash
npm run test-single-run
npm run protractor
```

**Development Workflow - Phase 0:**
```bash
# Terminal 1: Backend services
./start-test-servers.sh

# Terminal 2: AngularJS app (still using node-app.js)
# Already running from Terminal 1 (npm start at end of script)
```

**Deliverables:**
- AngularJS 1.8.3 running with modernized promises
- TypeScript configured
- Angular dependencies installed
- Directory structure created
- All tests passing
- No Bower dependencies
- Trix editor replacement chosen
- jQuery migration plan documented

---

## Phase 1: Angular Setup & Hybrid Bootstrap (Weeks 4-5)

### Objectives
- Set up Angular application structure
- Create hybrid bootstrap
- Configure development server
- Run AngularJS and Angular side-by-side

### Tasks

#### Week 4: Angular Application Setup

**4.1 Create Angular Module Structure**

Create `src/app/app.module.ts`:
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    UpgradeModule,
    AppRoutingModule
  ],
  providers: []
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) {}

  ngDoBootstrap() {
    // Bootstrap AngularJS first
    this.upgrade.bootstrap(document.body, ['recipe'], { strictDi: true });
  }
}
```

Create `src/app/app.component.ts`:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  title = 'recipe-web';
}
```

Create `src/main.ts`:
```typescript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

Create `src/index.html`:
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Recipe Connection</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

**4.2 Configure Angular Routing (Dual Router Setup)**

Create `src/app/app-routing.module.ts`:
```typescript
import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes, UrlHandlingStrategy, UrlTree } from '@angular/router';

// Custom URL handling strategy for hybrid routing
@Injectable()
export class Ng1Ng2UrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url: UrlTree): boolean {
    // Initially, let AngularJS handle all routes
    // As we migrate components, we'll add them here
    return false;
  }

  extract(url: UrlTree): UrlTree {
    return url;
  }

  merge(newUrlPart: UrlTree, rawUrl: UrlTree): UrlTree {
    return newUrlPart;
  }
}

const routes: Routes = [
  // Angular routes will be added here as components are migrated
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule],
  providers: [
    { provide: UrlHandlingStrategy, useClass: Ng1Ng2UrlHandlingStrategy }
  ]
})
export class AppRoutingModule { }
```

**4.3 Update AngularJS for Hybrid Mode**

Modify `app/recipe-lib/app.js`:
```javascript
// Enable strictDi for better Angular compatibility
angular.module('recipe', [
  'ngRoute',
  'ngCookies',
  'ngFileUpload',
  'angularTrix'
  // ... other modules
])
.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  // Use PathLocationStrategy compatible with Angular router
  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');

  // Keep existing routes for now
  $routeProvider
    .when('/home', {
      templateUrl: 'recipe-lib/home/home.html',
      controller: 'HomeCtrl'
    })
    // ... other routes
}]);

// Export for hybrid bootstrap
window.angularApp = angular.module('recipe');
```

**4.4 Create Proxy Configuration**

Create `proxy.conf.json`:
```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true
  }
}
```

Note: The proxy will forward API calls from Angular dev server (port 4200) to node-app.js (port 8000).

**4.5 Update Package Scripts**

Update `package.json`:
```json
{
  "scripts": {
    "ng": "ng",
    "start": "node node-app.js",
    "start:ng": "ng serve --proxy-config proxy.conf.json --port 4200",
    "start:all": "concurrently \"npm run start\" \"npm run start:ng\"",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "test": "ng test",
    "test:ngjs": "karma start karma.conf.js",
    "test-single-run": "karma start karma.conf.js --single-run",
    "lint": "ng lint",
    "e2e": "ng e2e",
    "protractor": "protractor e2e-tests/protractor.conf.js"
  }
}
```

Install concurrently:
```bash
npm install --save-dev concurrently
```

#### Week 5: Hybrid Testing & Validation

**5.1 Configure Angular Testing**

The Angular CLI already sets up testing. Verify configuration:
```bash
npm install --save-dev @angular/cli \
  @angular-devkit/build-angular \
  jasmine-core karma karma-jasmine \
  karma-chrome-launcher karma-jasmine-html-reporter
```

**5.2 Install Cypress (Parallel to Protractor)**

```bash
npm install --save-dev cypress @cypress/schematic
```

Create `cypress.config.ts`:
```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts'
  }
});
```

**Note:** We'll run Protractor tests throughout migration and gradually add Cypress tests for new Angular components.

**5.3 Verify Hybrid Bootstrap**

Test that both systems work together:

1. Start backend services:
```bash
docker start recipe-db recipe-service
node node-app.js  # Port 8000
```

2. Start Angular dev server:
```bash
ng serve --proxy-config proxy.conf.json  # Port 4200
```

3. Visit `http://localhost:4200` → Should see AngularJS app
4. Check browser console for errors
5. Verify API calls work through proxy

**5.4 Test Checklist**

Manual testing:
- [ ] AngularJS app loads
- [ ] Can navigate between AngularJS routes
- [ ] API calls work (check Network tab)
- [ ] User login/logout works
- [ ] No console errors
- [ ] Protractor tests still pass

**Development Workflow - Phase 1-4 (Hybrid):**
```bash
# Option 1: Run services + backend + Angular separately
# Terminal 1: Database and backend service
docker start recipe-db recipe-service

# Terminal 2: Node.js backend (Express)
node node-app.js

# Terminal 3: Angular dev server
ng serve --proxy-config proxy.conf.json

# Visit: http://localhost:4200

# Option 2: Use start-test-servers.sh + Angular
# Terminal 1: Backend services
./start-test-servers.sh

# Terminal 2: Angular dev server
ng serve --proxy-config proxy.conf.json

# Visit: http://localhost:4200
```

**Deliverables:**
- Angular 18 installed and configured
- Hybrid app bootstraps successfully
- Both AngularJS and Angular can run together
- Development workflow documented
- Cypress installed for future E2E tests
- All existing functionality works
- All Protractor tests passing

---

## Phase 2: Service Layer Migration (Weeks 6-10)

### Objectives
- Migrate all services to Angular
- Make Angular services available to AngularJS
- Create HTTP interceptor
- Update tests
- Thoroughly test authentication flow

### Migration Priority
1. **recipeService** - Core functionality, widely used
2. **userService** - Authentication, session management (CRITICAL)
3. **recipeBookService** - Depends on userService
4. **externalNavigationService** - Simple, standalone
5. **routeHistory** - Can be replaced with Angular Router

### Week 6-7: Core Services

#### 6.1 Migrate recipeService

Create `src/app/core/services/recipe.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recipe {
  recipeId?: string;
  recipeName: string;
  recipeContent: string;
  imageUrl?: string;
  editable?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = '/api/recipe';

  constructor(private http: HttpClient) {}

  findRecipe(recipeId: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${recipeId}`);
  }

  saveRecipe(recipe: Recipe): Observable<Recipe> {
    if (recipe.recipeId) {
      return this.http.put<Recipe>(`${this.apiUrl}/${recipe.recipeId}`, recipe);
    }
    return this.http.post<Recipe>(this.apiUrl, recipe);
  }

  searchRecipes(searchString?: string): Observable<Recipe[]> {
    const params: any = {};
    if (searchString) {
      params.searchString = searchString;
    }
    return this.http.get<Recipe[]>(this.apiUrl, { params });
  }

  allRecipesInUserBook(userId: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.apiUrl, {
      params: { recipeBook: userId }
    });
  }

  getRecipeList(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.apiUrl);
  }
}
```

**6.2 Downgrade for AngularJS Use**

Update `src/app/app.module.ts`:
```typescript
import { downgradeInjectable } from '@angular/upgrade/static';
import { RecipeService } from './core/services/recipe.service';

// In the constructor or ngDoBootstrap:
declare const angular: any;

@NgModule({
  // ... existing config
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) {}

  ngDoBootstrap() {
    // Downgrade Angular services for AngularJS
    angular.module('recipe')
      .factory('recipeService', downgradeInjectable(RecipeService));

    // Bootstrap AngularJS
    this.upgrade.bootstrap(document.body, ['recipe'], { strictDi: true });
  }
}
```

**6.3 Test Downgraded Service in AngularJS**

Create test `app/recipe-lib/recipe/recipe-service-downgrade.spec.js`:
```javascript
describe('Downgraded RecipeService', function() {
  beforeEach(module('recipe'));

  it('should be available in AngularJS', inject(function(recipeService) {
    expect(recipeService).toBeDefined();
    expect(recipeService.findRecipe).toBeDefined();
    expect(recipeService.searchRecipes).toBeDefined();
  }));

  it('should return Observable (not $q promise)', inject(function(recipeService) {
    var result = recipeService.searchRecipes();
    // Observable has subscribe method
    expect(result.subscribe).toBeDefined();
  }));
});
```

**6.4 Update AngularJS Controllers to Use Downgraded Service**

In AngularJS controllers, Observables need to be converted to promises:
```javascript
// In SearchCtrl or other controllers using recipeService
angular.module('recipe')
  .controller('SearchCtrl', ['$scope', 'recipeService', function($scope, recipeService) {
    // Convert Observable to Promise for AngularJS
    recipeService.searchRecipes($scope.searchString)
      .toPromise()
      .then(function(recipes) {
        $scope.recipes = recipes;
        $scope.$apply(); // Trigger digest cycle
      })
      .catch(function(err) {
        console.error(err);
      });
  }]);
```

Or create a compatibility wrapper:
```typescript
// In src/app/core/services/recipe.service.ts
// Add helper method for AngularJS compatibility
toPromise<T>(observable: Observable<T>): Promise<T> {
  return observable.toPromise();
}
```

#### 6.5 Migrate userService (CRITICAL)

Create `src/app/core/services/user.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface User {
  userId: string;
  userName: string;
  userEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USER_STORAGE_KEY = 'myrecipeconnection.com.usersLoggedInFromThisBrowser';
  private readonly GOOGLE_AUTH_KEY = 'RecipeConnectionGoogleAuth';

  private loggedInSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<User | null>(null);

  public loggedIn$ = this.loggedInSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeUser();
  }

  private initializeUser(): void {
    const userJson = localStorage.getItem(this.USER_STORAGE_KEY);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.userSubject.next(user);
        this.loggedInSubject.next(true);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem(this.USER_STORAGE_KEY);
      }
    }
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }

  getLoggedInUser(): User | null {
    return this.userSubject.value;
  }

  logIn(email: string): Observable<User> {
    return this.http.get<User>(`/api/user?email=${encodeURIComponent(email)}`)
      .pipe(
        tap(user => this.handleLogin(user))
      );
  }

  signUp(name: string, email: string): Observable<User> {
    const userToSave = { userName: name, userEmail: email };
    return this.http.post<User>('/api/user', userToSave)
      .pipe(
        tap(user => this.handleLogin(user))
      );
  }

  logOut(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    localStorage.removeItem(this.GOOGLE_AUTH_KEY);
    this.userSubject.next(null);
    this.loggedInSubject.next(false);
  }

  private handleLogin(user: User): void {
    this.userSubject.next(user);
    this.loggedInSubject.next(true);
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
  }

  performExternalLogin(): Observable<User | null> {
    const googleAuthJson = localStorage.getItem(this.GOOGLE_AUTH_KEY);
    if (!googleAuthJson) {
      return of(null);
    }

    try {
      const googleAuthUser = JSON.parse(googleAuthJson);
      return this.googleLogIn(googleAuthUser.userName, googleAuthUser.userEmail);
    } catch (e) {
      console.error('Failed to parse Google auth data', e);
      return of(null);
    }
  }

  private googleLogIn(name: string, email: string): Observable<User> {
    return this.http.get<User>(`/api/user?email=${encodeURIComponent(email)}`)
      .pipe(
        tap(user => this.handleLogin(user)),
        catchError(() => {
          // User doesn't exist, sign up
          return this.signUp(name, email);
        })
      );
  }
}
```

**Key Changes:**
- Replaced `$cookies` with `localStorage` (more modern, better browser support)
- Added RxJS observables for reactive state
- Removed callback-based `.success()` and `.error()`
- Type-safe with TypeScript interfaces
- Better error handling

#### 6.6 Create HTTP Interceptor

Replace `userHeaderInjector` with Angular interceptor:

Create `src/app/core/interceptors/user-header.interceptor.ts`:
```typescript
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable()
export class UserHeaderInterceptor implements HttpInterceptor {
  constructor(private userService: UserService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.userService.getLoggedInUser();

    if (user && user.userId) {
      const cloned = req.clone({
        headers: req.headers.set('RequestingUser', user.userId)
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}
```

Register in `src/app/app.module.ts`:
```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { UserHeaderInterceptor } from './core/interceptors/user-header.interceptor';

@NgModule({
  // ... existing config
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UserHeaderInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

#### 6.7 Comprehensive Authentication Flow Testing

**Critical Test Scenarios:**

Create `src/app/core/services/user.service.spec.ts`:
```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, User } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should initialize with no user', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getLoggedInUser()).toBe(null);
  });

  it('should initialize with stored user', () => {
    const user: User = { userId: '123', userName: 'Test', userEmail: 'test@test.com' };
    localStorage.setItem('myrecipeconnection.com.usersLoggedInFromThisBrowser', JSON.stringify(user));

    const newService = new UserService(httpMock as any);
    expect(newService.isLoggedIn()).toBe(true);
    expect(newService.getLoggedInUser()).toEqual(user);
  });

  it('should log in user and store in localStorage', (done) => {
    const user: User = { userId: '123', userName: 'Test', userEmail: 'test@test.com' };

    service.logIn('test@test.com').subscribe(() => {
      expect(service.isLoggedIn()).toBe(true);
      expect(service.getLoggedInUser()).toEqual(user);

      const stored = localStorage.getItem('myrecipeconnection.com.usersLoggedInFromThisBrowser');
      expect(JSON.parse(stored!)).toEqual(user);
      done();
    });

    const req = httpMock.expectOne('/api/user?email=test%40test.com');
    req.flush(user);
  });

  it('should log out and clear storage', () => {
    const user: User = { userId: '123', userName: 'Test', userEmail: 'test@test.com' };
    localStorage.setItem('myrecipeconnection.com.usersLoggedInFromThisBrowser', JSON.stringify(user));

    service.logOut();

    expect(service.isLoggedIn()).toBe(false);
    expect(service.getLoggedInUser()).toBe(null);
    expect(localStorage.getItem('myrecipeconnection.com.usersLoggedInFromThisBrowser')).toBe(null);
  });

  it('should handle Google OAuth login', (done) => {
    const googleUser = { userName: 'Google User', userEmail: 'google@test.com' };
    const user: User = { userId: '456', userName: 'Google User', userEmail: 'google@test.com' };

    localStorage.setItem('RecipeConnectionGoogleAuth', JSON.stringify(googleUser));

    service.performExternalLogin().subscribe(result => {
      expect(result).toEqual(user);
      expect(service.isLoggedIn()).toBe(true);
      done();
    });

    const req = httpMock.expectOne('/api/user?email=google%40test.com');
    req.flush(user);
  });
});
```

**Manual Testing Checklist:**
- [ ] Login with email works
- [ ] Sign up with new email works
- [ ] Logout clears all state
- [ ] Page refresh preserves logged-in state
- [ ] Google OAuth flow works
- [ ] Google OAuth callback populates user
- [ ] Logged-in state survives browser tab close/reopen
- [ ] HTTP interceptor adds RequestingUser header
- [ ] Protected API endpoints receive user ID

### Week 8-9: Supporting Services

#### 8.1 Migrate recipeBookService

Create `src/app/core/services/recipe-book.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UserService } from './user.service';

export interface RecipeBook {
  userId: string;
  recipes: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RecipeBookService {
  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {}

  getRecipeBook(userId?: string): Observable<RecipeBook> {
    const id = userId || this.userService.getLoggedInUser()?.userId;
    if (!id) {
      throw new Error('No user ID available');
    }
    return this.http.get<RecipeBook>(`/api/user/${id}/recipe-book`);
  }

  addToRecipeBook(recipeId: string): Observable<RecipeBook> {
    const userId = this.userService.getLoggedInUser()?.userId;
    if (!userId) {
      throw new Error('User must be logged in');
    }
    return this.http
      .post(`/api/user/${userId}/recipe-book`, { recipeId })
      .pipe(
        switchMap(() => this.getRecipeBook())
      );
  }

  removeRecipeFromBook(recipeId: string): Observable<RecipeBook> {
    const userId = this.userService.getLoggedInUser()?.userId;
    if (!userId) {
      throw new Error('User must be logged in');
    }
    return this.http
      .delete(`/api/user/${userId}/recipe-book/${recipeId}`)
      .pipe(
        switchMap(() => this.getRecipeBook())
      );
  }
}
```

#### 8.2 Migrate externalNavigationService

Create `src/app/core/services/external-navigation.service.ts`:
```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExternalNavigationService {
  navigateToGoogleOAuthLogin(callbackPath: string): void {
    window.location.href = `/auth/google?callbackPath=${encodeURIComponent(callbackPath)}`;
  }
}
```

#### 8.3 Downgrade All Services

Update `src/app/app.module.ts` ngDoBootstrap:
```typescript
ngDoBootstrap() {
  // Downgrade Angular services for AngularJS
  angular.module('recipe')
    .factory('recipeService', downgradeInjectable(RecipeService))
    .factory('userService', downgradeInjectable(UserService))
    .factory('recipeBookService', downgradeInjectable(RecipeBookService))
    .factory('externalNavigationService', downgradeInjectable(ExternalNavigationService));

  // Bootstrap AngularJS
  this.upgrade.bootstrap(document.body, ['recipe'], { strictDi: true });
}
```

### Week 10: Service Testing & Validation

**10.1 Create Angular Service Tests**

Create tests for all services (see user.service.spec.ts example above).

**10.2 Test AngularJS Integration**

Test that AngularJS controllers can use downgraded services:
```javascript
describe('AngularJS Controllers with Downgraded Services', function() {
  beforeEach(module('recipe'));

  it('SearchCtrl should work with downgraded recipeService',
    inject(function($controller, $rootScope, recipeService) {
      var scope = $rootScope.$new();
      var ctrl = $controller('SearchCtrl', { $scope: scope });

      expect(scope.search).toBeDefined();
      // Test that search function uses recipeService
    })
  );
});
```

**10.3 End-to-End Authentication Testing**

Run full authentication flow tests:
```bash
# Run Protractor tests focused on auth
npm run protractor
```

Verify:
- Login flow works
- Logout works
- Protected routes work
- Google OAuth works
- Session persistence works

**Deliverables:**
- All 5 services migrated to Angular
- Services downgraded and available to AngularJS
- HTTP interceptor replacing AngularJS interceptor
- Unit tests for all Angular services (80%+ coverage)
- AngularJS integration tests passing
- Authentication flow thoroughly tested
- AngularJS app still fully functional

---

## Phase 3: Component Migration (Weeks 11-18)

### Objectives
- Convert AngularJS controllers to Angular components
- Convert AngularJS directives to Angular components
- Set up routing with both routers side-by-side
- Gradually replace views
- Migrate or replace Trix editor
- Migrate file upload functionality

### Migration Order (by business value)

1. **Navbar** - Visible on all pages, good first component
2. **Home** - Landing page, high visibility
3. **Search** - Important feature
4. **Recipe Card (recipeElement)** - Reusable component
5. **View Recipe** - Recipe detail page
6. **Recipe Book** - User's collection
7. **New Recipe** - Recipe creation (includes editor migration)
8. **Image Upload** - Supporting feature
9. **User/Login** - Authentication UI
10. **View1/View2** - Remove (legacy)

### Week 11-12: Foundation Components

#### 11.1 Migrate Navbar

Create `src/app/shared/components/navbar/navbar.component.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, User } from '../../../core/services/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  user$: Observable<User | null>;
  loggedIn$: Observable<boolean>;

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.user$ = this.userService.user$;
    this.loggedIn$ = this.userService.loggedIn$;
  }

  ngOnInit(): void {}

  logOut(): void {
    this.userService.logOut();
    this.router.navigate(['/home']);
  }

  navigateToRecipeBook(): void {
    const user = this.userService.getLoggedInUser();
    if (user) {
      this.router.navigate(['/recipe-book', user.userId]);
    }
  }
}
```

Create `src/app/shared/components/navbar/navbar.component.html`:
```html
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <a class="navbar-brand" routerLink="/home">Recipe Connection</a>

  <div class="collapse navbar-collapse">
    <ul class="navbar-nav ml-auto">
      <li class="nav-item">
        <a class="nav-link" routerLink="/search">Search</a>
      </li>

      <ng-container *ngIf="loggedIn$ | async; else loginLink">
        <li class="nav-item">
          <a class="nav-link" style="cursor: pointer" (click)="navigateToRecipeBook()">My Recipes</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/new-recipe">Add Recipe</a>
        </li>
        <li class="nav-item">
          <span class="nav-link">{{ (user$ | async)?.userName }}</span>
        </li>
        <li class="nav-item">
          <a class="nav-link" style="cursor: pointer" (click)="logOut()">Log Out</a>
        </li>
      </ng-container>

      <ng-template #loginLink>
        <li class="nav-item">
          <a class="nav-link" routerLink="/user">Log In</a>
        </li>
      </ng-template>
    </ul>
  </div>
</nav>
```

Create `src/app/shared/components/navbar/navbar.component.css`:
```css
/* Add any custom navbar styles */
```

**11.2 Declare Navbar in Shared Module**

Create `src/app/shared/shared.module.ts`:
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@NgModule({
  declarations: [
    NavbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    NavbarComponent
  ]
})
export class SharedModule { }
```

Import SharedModule in AppModule:
```typescript
import { SharedModule } from './shared/shared.module';

@NgModule({
  imports: [
    // ...
    SharedModule
  ]
})
export class AppModule { }
```

**11.3 Downgrade Navbar for AngularJS**

Update `src/app/app.module.ts`:
```typescript
import { downgradeComponent } from '@angular/upgrade/static';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

ngDoBootstrap() {
  // Downgrade components
  angular.module('recipe')
    .directive('appNavbar', downgradeComponent({
      component: NavbarComponent
    }) as angular.IDirectiveFactory);

  // ... downgrade services

  this.upgrade.bootstrap(document.body, ['recipe'], { strictDi: true });
}
```

**11.4 Use Angular Navbar in AngularJS Views**

Update AngularJS templates to use Angular navbar:
```html
<!-- In app/index.html or AngularJS views -->
<app-navbar></app-navbar>
<div ng-view></div>
```

**11.5 Test Navbar**

- [ ] Navbar displays on all pages
- [ ] Links work (AngularJS routes still)
- [ ] Login/logout buttons show correctly
- [ ] User name displays when logged in
- [ ] No console errors

#### 11.6 Migrate Home Component

Create `src/app/features/home/home.component.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/search']);
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/user']);
  }

  navigateToSearch(): void {
    this.router.navigate(['/search']);
  }
}
```

Create `src/app/features/home/home.component.html`:
```html
<div class="container mt-5">
  <div class="jumbotron">
    <h1 class="display-4">Welcome to Recipe Connection</h1>
    <p class="lead">Your personal recipe collection and discovery platform.</p>
    <hr class="my-4">
    <p>Search for recipes, save your favorites, and create your own collection.</p>
    <div>
      <button class="btn btn-primary btn-lg mr-2" (click)="navigateToSearch()">
        Browse Recipes
      </button>
      <button class="btn btn-secondary btn-lg" (click)="navigateToLogin()">
        Log In
      </button>
    </div>
  </div>
</div>
```

**11.7 Add Home Route**

Update `src/app/app-routing.module.ts`:
```typescript
import { HomeComponent } from './features/home/home.component';

// Update URL handling strategy
@Injectable()
export class Ng1Ng2UrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url: UrlTree): boolean {
    // Angular handles these routes
    return url.toString().startsWith('/home') ||
           url.toString() === '/' ||
           url.toString() === '';
  }

  extract(url: UrlTree): UrlTree {
    return url;
  }

  merge(newUrlPart: UrlTree, rawUrl: UrlTree): UrlTree {
    return newUrlPart;
  }
}

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent }
];
```

**11.8 Update App Module**

```typescript
import { HomeComponent } from './features/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  // ...
})
```

**11.9 Test Home Component**

- [ ] Navigate to `/home` shows Angular component
- [ ] Redirects to search if logged in
- [ ] Buttons navigate correctly
- [ ] Navbar still visible

### Week 13-14: Recipe Display & Search

#### 13.1 Migrate Recipe Card Component

Create `src/app/features/recipe/recipe-card/recipe-card.component.ts`:
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Recipe } from '../../../core/services/recipe.service';

@Component({
  selector: 'app-recipe-card',
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.css']
})
export class RecipeCardComponent {
  @Input() recipe!: Recipe;
  @Input() showAddButton = false;
  @Input() showRemoveButton = false;
  @Output() addToBook = new EventEmitter<string>();
  @Output() removeFromBook = new EventEmitter<string>();
  @Output() viewRecipe = new EventEmitter<string>();

  onAddToBook(): void {
    if (this.recipe.recipeId) {
      this.addToBook.emit(this.recipe.recipeId);
    }
  }

  onRemoveFromBook(): void {
    if (this.recipe.recipeId) {
      this.removeFromBook.emit(this.recipe.recipeId);
    }
  }

  onViewRecipe(): void {
    if (this.recipe.recipeId) {
      this.viewRecipe.emit(this.recipe.recipeId);
    }
  }
}
```

Create `src/app/features/recipe/recipe-card/recipe-card.component.html`:
```html
<div class="card recipe-card h-100">
  <img
    *ngIf="recipe.imageUrl"
    [src]="recipe.imageUrl"
    class="card-img-top"
    [alt]="recipe.recipeName"
    style="height: 200px; object-fit: cover;">

  <div class="card-body d-flex flex-column">
    <h5 class="card-title">{{ recipe.recipeName }}</h5>

    <div class="mt-auto">
      <button
        class="btn btn-primary btn-sm"
        (click)="onViewRecipe()">
        View Recipe
      </button>

      <button
        *ngIf="showAddButton"
        class="btn btn-secondary btn-sm ml-2"
        (click)="onAddToBook()">
        Add to My Recipes
      </button>

      <button
        *ngIf="showRemoveButton"
        class="btn btn-danger btn-sm ml-2"
        (click)="onRemoveFromBook()">
        Remove
      </button>
    </div>
  </div>
</div>
```

#### 13.2 Migrate Search Component

Create `src/app/features/search/search.component.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs/operators';
import { RecipeService, Recipe } from '../../core/services/recipe.service';
import { RecipeBookService } from '../../core/services/recipe-book.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchControl = new FormControl('');
  recipes: Recipe[] = [];
  loading = false;
  isLoggedIn = false;

  constructor(
    private recipeService: RecipeService,
    private recipeBookService: RecipeBookService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.userService.isLoggedIn();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        switchMap(searchTerm => {
          this.loading = true;
          return this.recipeService.searchRecipes(searchTerm || '');
        })
      )
      .subscribe(recipes => {
        this.recipes = recipes;
        this.loading = false;
      });

    // Initial load
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.loading = true;
    this.recipeService.searchRecipes().subscribe(recipes => {
      this.recipes = recipes;
      this.loading = false;
    });
  }

  addToRecipeBook(recipeId: string): void {
    this.recipeBookService.addToRecipeBook(recipeId).subscribe(() => {
      alert('Recipe added to your collection!');
    });
  }

  viewRecipe(recipeId: string): void {
    this.router.navigate(['/recipe', recipeId]);
  }
}
```

Create `src/app/features/search/search.component.html`:
```html
<div class="container mt-4">
  <h2>Search Recipes</h2>

  <div class="form-group">
    <input
      type="text"
      class="form-control"
      [formControl]="searchControl"
      placeholder="Search for recipes...">
  </div>

  <div *ngIf="loading" class="text-center my-4">
    <div class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>

  <div class="row">
    <div class="col-md-4 mb-4" *ngFor="let recipe of recipes">
      <app-recipe-card
        [recipe]="recipe"
        [showAddButton]="isLoggedIn"
        (addToBook)="addToRecipeBook($event)"
        (viewRecipe)="viewRecipe($event)">
      </app-recipe-card>
    </div>
  </div>

  <div *ngIf="!loading && recipes.length === 0" class="alert alert-info">
    No recipes found. Try a different search term.
  </div>
</div>
```

**13.3 Create Recipe Feature Module**

Create `src/app/features/recipe/recipe.module.ts`:
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecipeCardComponent } from './recipe-card/recipe-card.component';

@NgModule({
  declarations: [
    RecipeCardComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    RecipeCardComponent
  ]
})
export class RecipeModule { }
```

**13.4 Create Search Module**

Create `src/app/features/search/search.module.ts`:
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchComponent } from './search.component';
import { RecipeModule } from '../recipe/recipe.module';

@NgModule({
  declarations: [
    SearchComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RecipeModule
  ]
})
export class SearchModule { }
```

**13.5 Update Routes**

```typescript
import { SearchComponent } from './features/search/search.component';

@Injectable()
export class Ng1Ng2UrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url: UrlTree): boolean {
    return url.toString().startsWith('/home') ||
           url.toString().startsWith('/search') ||
           url.toString() === '/' ||
           url.toString() === '';
  }
  // ...
}

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'search', component: SearchComponent }
];
```

**13.6 Update App Module**

```typescript
import { SearchModule } from './features/search/search.module';
import { RecipeModule } from './features/recipe/recipe.module';

@NgModule({
  imports: [
    // ...
    SearchModule,
    RecipeModule
  ]
})
export class AppModule { }
```

### Week 15-16: View Recipe & Recipe Book

#### 15.1 Migrate View Recipe Component

Create `src/app/features/recipe/view-recipe/view-recipe.component.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService, Recipe } from '../../../core/services/recipe.service';
import { RecipeBookService } from '../../../core/services/recipe-book.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-view-recipe',
  templateUrl: './view-recipe.component.html',
  styleUrls: ['./view-recipe.component.css']
})
export class ViewRecipeComponent implements OnInit {
  recipe: Recipe | null = null;
  loading = true;
  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private recipeBookService: RecipeBookService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.userService.isLoggedIn();

    const recipeId = this.route.snapshot.paramMap.get('id');
    if (recipeId) {
      this.loadRecipe(recipeId);
    }
  }

  loadRecipe(recipeId: string): void {
    this.loading = true;
    this.recipeService.findRecipe(recipeId).subscribe({
      next: (recipe) => {
        this.recipe = recipe;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load recipe', err);
        this.loading = false;
      }
    });
  }

  addToRecipeBook(): void {
    if (this.recipe?.recipeId) {
      this.recipeBookService.addToRecipeBook(this.recipe.recipeId).subscribe(() => {
        alert('Recipe added to your collection!');
      });
    }
  }

  editRecipe(): void {
    if (this.recipe?.recipeId) {
      this.router.navigate(['/edit-recipe', this.recipe.recipeId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/search']);
  }
}
```

Create `src/app/features/recipe/view-recipe/view-recipe.component.html`:
```html
<div class="container mt-4">
  <button class="btn btn-secondary mb-3" (click)="goBack()">
    &larr; Back to Search
  </button>

  <div *ngIf="loading" class="text-center">
    <div class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>

  <div *ngIf="!loading && recipe">
    <div class="row">
      <div class="col-md-8">
        <h1>{{ recipe.recipeName }}</h1>

        <img
          *ngIf="recipe.imageUrl"
          [src]="recipe.imageUrl"
          [alt]="recipe.recipeName"
          class="img-fluid mb-3"
          style="max-height: 400px; object-fit: cover;">

        <div class="recipe-content" [innerHTML]="recipe.recipeContent"></div>
      </div>

      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Actions</h5>

            <button
              *ngIf="isLoggedIn && !recipe.editable"
              class="btn btn-primary btn-block mb-2"
              (click)="addToRecipeBook()">
              Add to My Recipes
            </button>

            <button
              *ngIf="recipe.editable"
              class="btn btn-warning btn-block mb-2"
              (click)="editRecipe()">
              Edit Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div *ngIf="!loading && !recipe" class="alert alert-warning">
    Recipe not found.
  </div>
</div>
```

#### 15.2 Migrate Recipe Book Component

Create `src/app/features/recipe-book/recipe-book.component.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService, Recipe } from '../../core/services/recipe.service';
import { RecipeBookService } from '../../core/services/recipe-book.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-recipe-book',
  templateUrl: './recipe-book.component.html',
  styleUrls: ['./recipe-book.component.css']
})
export class RecipeBookComponent implements OnInit {
  recipes: Recipe[] = [];
  loading = true;
  userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private recipeBookService: RecipeBookService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId');
    if (this.userId) {
      this.loadRecipeBook();
    }
  }

  loadRecipeBook(): void {
    if (!this.userId) return;

    this.loading = true;
    this.recipeService.allRecipesInUserBook(this.userId).subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load recipe book', err);
        this.loading = false;
      }
    });
  }

  removeFromBook(recipeId: string): void {
    if (confirm('Remove this recipe from your collection?')) {
      this.recipeBookService.removeRecipeFromBook(recipeId).subscribe(() => {
        this.loadRecipeBook();
      });
    }
  }

  viewRecipe(recipeId: string): void {
    this.router.navigate(['/recipe', recipeId]);
  }
}
```

Create `src/app/features/recipe-book/recipe-book.component.html`:
```html
<div class="container mt-4">
  <h2>My Recipe Collection</h2>

  <div *ngIf="loading" class="text-center my-4">
    <div class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>

  <div class="row">
    <div class="col-md-4 mb-4" *ngFor="let recipe of recipes">
      <app-recipe-card
        [recipe]="recipe"
        [showRemoveButton]="true"
        (removeFromBook)="removeFromBook($event)"
        (viewRecipe)="viewRecipe($event)">
      </app-recipe-card>
    </div>
  </div>

  <div *ngIf="!loading && recipes.length === 0" class="alert alert-info">
    Your recipe collection is empty. Visit the search page to add recipes!
  </div>
</div>
```

**15.3 Update Routes**

```typescript
import { ViewRecipeComponent } from './features/recipe/view-recipe/view-recipe.component';
import { RecipeBookComponent } from './features/recipe-book/recipe-book.component';

@Injectable()
export class Ng1Ng2UrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url: UrlTree): boolean {
    return url.toString().startsWith('/home') ||
           url.toString().startsWith('/search') ||
           url.toString().startsWith('/recipe') ||
           url.toString().startsWith('/recipe-book') ||
           url.toString() === '/' ||
           url.toString() === '';
  }
  // ...
}

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'recipe/:id', component: ViewRecipeComponent },
  { path: 'recipe-book/:userId', component: RecipeBookComponent }
];
```

### Week 17: New Recipe & Editor Migration

#### 17.1 Install Quill.js

```bash
npm install quill ngx-quill
```

#### 17.2 Create New Recipe Component

Create `src/app/features/recipe/new-recipe/new-recipe.component.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecipeService } from '../../../core/services/recipe.service';

@Component({
  selector: 'app-new-recipe',
  templateUrl: './new-recipe.component.html',
  styleUrls: ['./new-recipe.component.css']
})
export class NewRecipeComponent implements OnInit {
  recipeForm: FormGroup;
  saving = false;

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private router: Router
  ) {
    this.recipeForm = this.fb.group({
      recipeName: ['', Validators.required],
      recipeContent: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  saveRecipe(): void {
    if (this.recipeForm.valid) {
      this.saving = true;
      this.recipeService.saveRecipe(this.recipeForm.value).subscribe({
        next: (recipe) => {
          this.saving = false;
          this.router.navigate(['/recipe', recipe.recipeId]);
        },
        error: (err) => {
          console.error('Failed to save recipe', err);
          this.saving = false;
          alert('Failed to save recipe. Please try again.');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/search']);
  }
}
```

Create `src/app/features/recipe/new-recipe/new-recipe.component.html`:
```html
<div class="container mt-4">
  <h2>Create New Recipe</h2>

  <form [formGroup]="recipeForm" (ngSubmit)="saveRecipe()">
    <div class="form-group">
      <label for="recipeName">Recipe Name</label>
      <input
        type="text"
        class="form-control"
        id="recipeName"
        formControlName="recipeName"
        placeholder="Enter recipe name">
      <div *ngIf="recipeForm.get('recipeName')?.invalid && recipeForm.get('recipeName')?.touched"
           class="text-danger">
        Recipe name is required
      </div>
    </div>

    <div class="form-group">
      <label for="recipeContent">Recipe Content</label>
      <quill-editor
        formControlName="recipeContent"
        [modules]="quillConfig"
        placeholder="Enter ingredients and instructions...">
      </quill-editor>
      <div *ngIf="recipeForm.get('recipeContent')?.invalid && recipeForm.get('recipeContent')?.touched"
           class="text-danger">
        Recipe content is required
      </div>
    </div>

    <div class="form-group">
      <button
        type="submit"
        class="btn btn-primary"
        [disabled]="recipeForm.invalid || saving">
        {{ saving ? 'Saving...' : 'Save Recipe' }}
      </button>
      <button
        type="button"
        class="btn btn-secondary ml-2"
        (click)="cancel()">
        Cancel
      </button>
    </div>
  </form>
</div>
```

**17.3 Import QuillModule**

Update `src/app/features/recipe/recipe.module.ts`:
```typescript
import { QuillModule } from 'ngx-quill';
import { ReactiveFormsModule } from '@angular/forms';
import { NewRecipeComponent } from './new-recipe/new-recipe.component';
import { ViewRecipeComponent } from './view-recipe/view-recipe.component';

@NgModule({
  declarations: [
    RecipeCardComponent,
    NewRecipeComponent,
    ViewRecipeComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    QuillModule.forRoot()
  ],
  exports: [
    RecipeCardComponent
  ]
})
export class RecipeModule { }
```

**17.4 Update Routes**

```typescript
import { NewRecipeComponent } from './features/recipe/new-recipe/new-recipe.component';
import { AuthGuard } from './core/guards/auth.guard';

// Create AuthGuard first
const routes: Routes = [
  // ...
  { path: 'new-recipe', component: NewRecipeComponent, canActivate: [AuthGuard] }
];
```

**17.5 Create Auth Guard**

Create `src/app/core/guards/auth.guard.ts`:
```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    if (this.userService.isLoggedIn()) {
      return true;
    }
    return this.router.createUrlTree(['/user']);
  }
}
```

### Week 18: Image Upload & User/Login

#### 18.1 Create Image Upload Service

Create `src/app/core/services/image-upload.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImageUploadResponse {
  imageId: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private apiUrl = '/api/image';

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<ImageUploadResponse>(this.apiUrl, formData);
  }

  deleteImage(imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${imageId}`);
  }
}
```

#### 18.2 Update New Recipe Component with Image Upload

Update `new-recipe.component.ts`:
```typescript
import { ImageUploadService } from '../../../core/services/image-upload.service';

export class NewRecipeComponent implements OnInit {
  // ...
  selectedFile: File | null = null;
  imageUrl: string | null = null;
  uploading = false;

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private imageUploadService: ImageUploadService,
    private router: Router
  ) {
    this.recipeForm = this.fb.group({
      recipeName: ['', Validators.required],
      recipeContent: ['', Validators.required],
      imageUrl: ['']
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadImage(): void {
    if (this.selectedFile) {
      this.uploading = true;
      this.imageUploadService.uploadImage(this.selectedFile).subscribe({
        next: (response) => {
          this.imageUrl = response.imageUrl;
          this.recipeForm.patchValue({ imageUrl: response.imageUrl });
          this.uploading = false;
        },
        error: (err) => {
          console.error('Image upload failed', err);
          this.uploading = false;
          alert('Image upload failed. Please try again.');
        }
      });
    }
  }

  // ... rest of component
}
```

Update `new-recipe.component.html` to include image upload:
```html
<!-- Add after recipe name -->
<div class="form-group">
  <label for="imageFile">Recipe Image (optional)</label>
  <input
    type="file"
    class="form-control-file"
    id="imageFile"
    accept="image/*"
    (change)="onFileSelected($event)">

  <button
    *ngIf="selectedFile && !imageUrl"
    type="button"
    class="btn btn-sm btn-secondary mt-2"
    [disabled]="uploading"
    (click)="uploadImage()">
    {{ uploading ? 'Uploading...' : 'Upload Image' }}
  </button>

  <div *ngIf="imageUrl" class="mt-2">
    <img [src]="imageUrl" alt="Recipe preview" style="max-width: 200px;">
  </div>
</div>
```

#### 18.3 Create User/Login Component

Create `src/app/features/user/user.component.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { ExternalNavigationService } from '../../core/services/external-navigation.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  loginForm: FormGroup;
  signupForm: FormGroup;
  mode: 'login' | 'signup' = 'login';
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private externalNavigationService: ExternalNavigationService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Check for Google OAuth login
    this.userService.performExternalLogin().subscribe(user => {
      if (user) {
        this.router.navigate(['/search']);
      }
    });
  }

  switchMode(): void {
    this.mode = this.mode === 'login' ? 'signup' : 'login';
    this.error = null;
  }

  login(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;

      this.userService.logIn(this.loginForm.value.email).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/search']);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Login failed. User not found.';
        }
      });
    }
  }

  signup(): void {
    if (this.signupForm.valid) {
      this.loading = true;
      this.error = null;

      this.userService.signUp(
        this.signupForm.value.name,
        this.signupForm.value.email
      ).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/search']);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Signup failed. Please try again.';
        }
      });
    }
  }

  loginWithGoogle(): void {
    this.externalNavigationService.navigateToGoogleOAuthLogin('/search');
  }
}
```

Create `src/app/features/user/user.component.html`:
```html
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body">
          <h3 class="card-title text-center">
            {{ mode === 'login' ? 'Log In' : 'Sign Up' }}
          </h3>

          <div *ngIf="error" class="alert alert-danger">
            {{ error }}
          </div>

          <!-- Login Form -->
          <form *ngIf="mode === 'login'" [formGroup]="loginForm" (ngSubmit)="login()">
            <div class="form-group">
              <label for="loginEmail">Email</label>
              <input
                type="email"
                class="form-control"
                id="loginEmail"
                formControlName="email"
                placeholder="Enter your email">
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block"
              [disabled]="loginForm.invalid || loading">
              {{ loading ? 'Logging in...' : 'Log In' }}
            </button>
          </form>

          <!-- Signup Form -->
          <form *ngIf="mode === 'signup'" [formGroup]="signupForm" (ngSubmit)="signup()">
            <div class="form-group">
              <label for="signupName">Name</label>
              <input
                type="text"
                class="form-control"
                id="signupName"
                formControlName="name"
                placeholder="Enter your name">
            </div>

            <div class="form-group">
              <label for="signupEmail">Email</label>
              <input
                type="email"
                class="form-control"
                id="signupEmail"
                formControlName="email"
                placeholder="Enter your email">
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block"
              [disabled]="signupForm.invalid || loading">
              {{ loading ? 'Signing up...' : 'Sign Up' }}
            </button>
          </form>

          <hr>

          <button
            type="button"
            class="btn btn-danger btn-block"
            (click)="loginWithGoogle()">
            <i class="fab fa-google"></i> Continue with Google
          </button>

          <div class="text-center mt-3">
            <a href="#" (click)="switchMode(); $event.preventDefault()">
              {{ mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in' }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**18.4 Update Routes**

```typescript
import { UserComponent } from './features/user/user.component';

@Injectable()
export class Ng1Ng2UrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url: UrlTree): boolean {
    // Angular handles all routes now except legacy ones
    return !url.toString().startsWith('/view1') &&
           !url.toString().startsWith('/view2');
  }
  // ...
}

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'recipe/:id', component: ViewRecipeComponent },
  { path: 'new-recipe', component: NewRecipeComponent, canActivate: [AuthGuard] },
  { path: 'recipe-book/:userId', component: RecipeBookComponent, canActivate: [AuthGuard] },
  { path: 'user', component: UserComponent }
];
```

**Deliverables:**
- All controllers converted to Angular components
- All directives converted to Angular components
- Quill.js editor successfully integrated
- Image upload working with Angular
- Dual routing working smoothly
- Tests for all new components
- All major features migrated
- AngularJS only handling legacy view1/view2

---

## Phase 4: Routing & Navigation Cleanup (Week 19)

### Objectives
- Complete migration to Angular Router
- Remove AngularJS routing
- Clean up dual-router setup
- Remove legacy views

### Tasks

#### 19.1 Remove Legacy Views

Delete:
```bash
rm -rf app/recipe-lib/view1
rm -rf app/recipe-lib/view2
```

#### 19.2 Complete Route Migration

Update `src/app/app-routing.module.ts`:
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { SearchComponent } from './features/search/search.component';
import { ViewRecipeComponent } from './features/recipe/view-recipe/view-recipe.component';
import { NewRecipeComponent } from './features/recipe/new-recipe/new-recipe.component';
import { RecipeBookComponent } from './features/recipe-book/recipe-book.component';
import { UserComponent } from './features/user/user.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'recipe/:id', component: ViewRecipeComponent },
  { path: 'new-recipe', component: NewRecipeComponent, canActivate: [AuthGuard] },
  { path: 'recipe-book/:userId', component: RecipeBookComponent, canActivate: [AuthGuard] },
  { path: 'user', component: UserComponent },
  { path: '**', redirectTo: '/home' }  // 404 redirect
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

#### 19.3 Remove AngularJS Router

Update `app/recipe-lib/app.js`:
```javascript
// Remove ngRoute dependency
angular.module('recipe', [
  'ngCookies',
  // 'ngRoute',  // REMOVE
  // ... other modules except ngRoute
])
// Remove .config with $routeProvider
// .config(['$locationProvider', '$routeProvider', ...])  // REMOVE
```

#### 19.4 Update App Bootstrap

Update `src/app/app.module.ts`:
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { RecipeModule } from './features/recipe/recipe.module';
import { SearchModule } from './features/search/search.module';
import { UserHeaderInterceptor } from './core/interceptors/user-header.interceptor';

// Remove UpgradeModule
// import { UpgradeModule } from '@angular/upgrade/static';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule,
    RecipeModule,
    SearchModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UserHeaderInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]  // Normal Angular bootstrap
})
export class AppModule { }
```

Update `src/app/app.component.ts`:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'Recipe Connection';
}
```

#### 19.5 Update Index HTML

Update `src/index.html`:
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Recipe Connection</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

#### 19.6 Test Complete Angular App

Manual testing checklist:
- [ ] All routes work
- [ ] Navigation works
- [ ] User login/logout works
- [ ] Recipe CRUD works
- [ ] Recipe book works
- [ ] Image upload works
- [ ] Browser back/forward works
- [ ] Page refresh works
- [ ] No console errors
- [ ] All Protractor tests pass

**Development Workflow - Phase 5:**
```bash
# Terminal 1: Backend services
docker start recipe-db recipe-service
node node-app.js

# Terminal 2: Angular CLI
ng serve

# Visit: http://localhost:4200
```

**Deliverables:**
- 100% Angular routing
- AngularJS completely removed
- All navigation working
- Clean URLs with HTML5 mode
- All tests passing

---

## Phase 5: Cleanup & Optimization (Weeks 20-22)

### Objectives
- Remove all AngularJS code and dependencies
- Remove jQuery and Underscore
- Optimize bundle size
- Migrate to Cypress from Protractor
- Consider Bootstrap 5 upgrade
- Final testing and polish

### Tasks

### Week 20: Code Cleanup

#### 20.1 Remove AngularJS Files

Delete:
```bash
rm -rf app/recipe-lib/
rm -rf app/bower_components/
rm bower.json
rm karma.conf.js  # Keep Angular's karma config
```

#### 20.2 Remove AngularJS Dependencies

Update `package.json`:
```bash
npm uninstall angular angular-route angular-cookies \
  @angular/upgrade \
  bower \
  ng-file-upload \
  angular-trix \
  karma-ng-html2js-preprocessor
```

#### 20.3 Remove jQuery

Audit jQuery usage (should be none after migration):
```bash
grep -r "jquery\|jQuery\|\$\(" src/
```

If any jQuery found, replace with Angular equivalents:
- DOM manipulation → Renderer2 or template directives
- Event handling → Angular event binding
- AJAX → HttpClient

Remove jQuery:
```bash
npm uninstall jquery
```

#### 20.4 Remove Underscore

Replace Underscore with native JavaScript:
```bash
# Find usages
grep -r "underscore\|_\." src/

# Replace common patterns:
# _.map() → array.map()
# _.filter() → array.filter()
# _.find() → array.find()
# _.reduce() → array.reduce()
# _.each() → array.forEach()
```

Remove Underscore:
```bash
npm uninstall underscore
```

#### 20.5 Update Build Scripts

Update `package.json`:
```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve --proxy-config proxy.conf.json",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "cypress run",
    "e2e:open": "cypress open"
  }
}
```

### Week 21: Testing Migration & Bootstrap Consideration

#### 21.1 Migrate Protractor to Cypress

Install Cypress:
```bash
npm install --save-dev cypress @cypress/schematic
```

Create Cypress tests for critical flows:

Create `cypress/e2e/user-flow.cy.ts`:
```typescript
describe('User Authentication Flow', () => {
  it('should login successfully', () => {
    cy.visit('/user');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/search');
  });

  it('should logout successfully', () => {
    // Login first
    cy.visit('/user');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('button[type="submit"]').click();

    // Logout
    cy.contains('Log Out').click();
    cy.url().should('include', '/home');
  });
});

describe('Recipe Flow', () => {
  beforeEach(() => {
    // Login
    cy.visit('/user');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('button[type="submit"]').click();
  });

  it('should create new recipe', () => {
    cy.visit('/new-recipe');
    cy.get('input[formControlName="recipeName"]').type('Test Recipe');
    cy.get('.ql-editor').type('Test ingredients and instructions');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/recipe/');
  });

  it('should search for recipes', () => {
    cy.visit('/search');
    cy.get('input[type="text"]').type('pasta');
    cy.get('.recipe-card').should('have.length.greaterThan', 0);
  });
});
```

Remove Protractor:
```bash
npm uninstall protractor
rm -rf e2e-tests/
```

#### 21.2 Bootstrap 5 Decision

**Option A: Stay on Bootstrap 4**
- Pros: No breaking changes, works as-is
- Cons: Using older version

**Option B: Upgrade to Bootstrap 5**
- Pros: Modern, jQuery-free (already removed jQuery)
- Cons: Requires updating class names

If upgrading to Bootstrap 5:
```bash
npm uninstall bootstrap
npm install bootstrap@5
```

Update all templates:
```html
<!-- Bootstrap 4 → Bootstrap 5 -->
.ml-* → .ms-*  (margin-left → margin-start)
.mr-* → .me-*  (margin-right → margin-end)
.pl-* → .ps-*  (padding-left → padding-start)
.pr-* → .pe-*  (padding-right → padding-end)

<!-- Forms -->
.form-control-file → .form-control
.custom-select → .form-select
```

Run search and replace:
```bash
# In src/ directory
find . -name "*.html" -exec sed -i '' 's/ml-/ms-/g' {} +
find . -name "*.html" -exec sed -i '' 's/mr-/me-/g' {} +
find . -name "*.html" -exec sed -i '' 's/pl-/ps-/g' {} +
find . -name "*.html" -exec sed -i '' 's/pr-/pe-/g' {} +
```

**Recommendation:** Stay on Bootstrap 4 to reduce risk. Upgrade later if needed.

### Week 22: Optimization & Final Testing

#### 22.1 Bundle Optimization

Update `angular.json`:
```json
{
  "projects": {
    "recipe-web": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": false,
              "aot": true,
              "extractLicenses": true,
              "buildOptimizer": true,
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "6kb",
                  "maximumError": "10kb"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

#### 22.2 Lazy Loading (Optional Performance Optimization)

Convert feature modules to lazy-loaded:

Update `app-routing.module.ts`:
```typescript
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./features/search/search.module').then(m => m.SearchModule)
  },
  // ... other lazy-loaded routes
  { path: '**', redirectTo: '/home' }
];
```

#### 22.3 Production Build Test

Build for production:
```bash
npm run build:prod
```

Check bundle sizes:
```bash
ls -lh dist/recipe-web/*.js
```

Serve production build locally:
```bash
# Update node-app.js to serve from dist/recipe-web in production
NODE_ENV=production node node-app.js
```

#### 22.4 Cross-Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### 22.5 Performance Testing

Run Lighthouse audit:
```bash
# In Chrome DevTools
# Lighthouse → Generate report
```

Target scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

#### 22.6 Final Testing Suite

Run all tests:
```bash
npm run lint              # Linting
npm run test              # Unit tests (Angular)
npm run e2e               # E2E tests (Cypress)
npm run build:prod        # Production build
```

Verify all pass with no errors.

#### 22.7 Update Documentation

Create `README.md`:
```markdown
# Recipe Connection

Modern recipe management application built with Angular 18.

## Development

### Prerequisites
- Node.js 18+
- Docker
- PostgreSQL (via Docker)

### Setup
1. Install dependencies: `npm install`
2. Start backend services: `./start-test-servers.sh`
3. Start Angular dev server: `ng serve`
4. Visit: `http://localhost:4200`

### Testing
- Unit tests: `npm test`
- E2E tests: `npm run e2e`
- Lint: `npm run lint`

### Production Build
```bash
npm run build:prod
NODE_ENV=production node node-app.js
```

## Architecture
- Angular 18 frontend
- Node.js/Express backend
- PostgreSQL database
- DigitalOcean Spaces for image storage
```

**Deliverables:**
- Zero AngularJS code remaining
- Zero jQuery code
- Zero Underscore code
- Optimized bundle size (< 1MB)
- Cypress E2E tests passing
- All unit tests passing
- Production build successful
- Cross-browser tested
- Lighthouse score > 90
- Documentation updated

---

## Testing Strategy Throughout Migration

### Unit Testing
- Write Angular tests for each new service/component
- Maintain AngularJS tests until component is migrated
- Aim for 80%+ code coverage
- Use Angular Testing Library for component tests

### Integration Testing
- During hybrid phase: Test service downgrades work in AngularJS
- Test component downgrades work in AngularJS
- Test Angular and AngularJS services interact correctly
- After Phase 4: Pure Angular integration tests

### E2E Testing
- **Weeks 1-18:** Keep Protractor tests running (existing functionality)
- **Week 11 onwards:** Start adding Cypress tests for new Angular features
- **Week 21:** Migrate all critical flows to Cypress, remove Protractor
- Focus on user flows: login, search, create recipe, recipe book

### Manual Testing Checklist (After Each Phase)
- [ ] User login/logout
- [ ] Google OAuth login
- [ ] Recipe search
- [ ] View recipe details
- [ ] Create new recipe
- [ ] Edit recipe
- [ ] Upload image
- [ ] Add/remove from recipe book
- [ ] Navigation between all pages
- [ ] Browser back/forward buttons
- [ ] Page refresh maintains state
- [ ] No console errors

---

## Risk Mitigation

### High-Risk Areas

**1. User Session Management (CRITICAL)**
- Risk: Users logged out unexpectedly, session lost
- Mitigation:
  - Thorough testing of userService migration
  - Keep localStorage in sync during hybrid phase
  - Test Google OAuth flow extensively
  - Comprehensive E2E tests for auth

**2. Rich Text Editor (Trix → Quill.js)**
- Risk: Existing recipe content not displaying correctly
- Mitigation:
  - Test Quill.js with existing recipe HTML early (Week 2)
  - Ensure Quill can render Trix-generated HTML
  - Consider data migration if formats incompatible
  - Have rollback plan

**3. Image Upload**
- Risk: File upload breaks, large files fail
- Mitigation:
  - Test with various file sizes (1KB - 10MB)
  - Test different image formats (JPG, PNG, GIF)
  - Verify DigitalOcean Spaces integration
  - Keep existing endpoint, just change frontend

**4. Routing Conflicts During Hybrid Phase**
- Risk: Angular and AngularJS routers conflict, infinite loops
- Mitigation:
  - Careful URL handling strategy with shouldProcessUrl
  - Comprehensive routing tests
  - Test browser navigation (back/forward)
  - Monitor for redirect loops

**5. jQuery Removal**
- Risk: Hidden jQuery dependencies breaking features
- Mitigation:
  - Complete audit in Week 2
  - Document all jQuery usage before removing
  - Test each replacement thoroughly
  - Keep jQuery until Phase 5 if needed

### Rollback Plan

Each phase in its own Git branch:
```bash
git checkout -b feature/phase0-preparation
git checkout -b feature/phase1-hybrid-setup
git checkout -b feature/phase2-services
git checkout -b feature/phase3-components
git checkout -b feature/phase4-routing
git checkout -b feature/phase5-cleanup
```

Merge strategy:
- Create PR for each phase
- Require all tests passing before merge
- If critical issues arise, can revert specific phase
- Keep `master` branch always deployable

---

## Success Metrics

### Technical Metrics
- [ ] Zero AngularJS dependencies
- [ ] Zero jQuery code
- [ ] Zero Underscore code
- [ ] Bundle size < 1MB (production, gzipped)
- [ ] Lighthouse Performance score > 90
- [ ] Lighthouse Accessibility score > 90
- [ ] Test coverage > 80%
- [ ] Zero console errors
- [ ] All E2E tests passing (100%)
- [ ] All unit tests passing (100%)

### Business Metrics
- [ ] All features working (no regressions)
- [ ] No user-reported bugs from migration
- [ ] Page load time < 2s (initial load)
- [ ] No degradation in user workflows
- [ ] Image upload still works
- [ ] Google OAuth still works
- [ ] User sessions persist correctly

### Code Quality Metrics
- [ ] TypeScript strict mode enabled
- [ ] No `any` types (or minimal, documented)
- [ ] Consistent code style (enforced by linter)
- [ ] Clear component structure
- [ ] Reusable components extracted

---

## Timeline Summary

| Phase | Weeks | Key Deliverables | Risk Level |
|-------|-------|------------------|------------|
| 0: Preparation | 1-3 | AngularJS 1.8, TypeScript, Dependencies researched, jQuery audited | Low |
| 1: Hybrid Setup | 4-5 | Angular 18 installed, hybrid bootstrap, Cypress installed | Medium |
| 2: Services | 6-10 | All services in Angular, downgraded, auth thoroughly tested | High |
| 3: Components | 11-18 | All components migrated, Quill.js integrated, image upload | High |
| 4: Routing | 19 | Pure Angular routing, AngularJS removed | Medium |
| 5: Cleanup | 20-22 | Production-ready, optimized, tested, documented | Low |

**Total: 20-26 weeks (5-6.5 months)**

**Critical Path:**
- Week 2: Trix editor decision (blocks Week 17)
- Weeks 6-10: Service migration & auth testing (blocks everything else)
- Week 17: Quill.js integration (must work before Phase 4)
- Week 21: Cypress migration (must pass before production)

---

## Next Steps

### Immediate Actions (This Week)

1. **Review and Approve Plan**
   - Stakeholder review
   - Adjust timeline if needed
   - Confirm resource availability

2. **Set Up Development Environment**
   - Create feature branch: `git checkout -b feature/angular-migration-phase0`
   - Back up current production database
   - Set up staging environment
   - Verify `start-test-servers.sh` works

3. **Begin Phase 0, Week 1**
   - [ ] Upgrade AngularJS to 1.8.3
   - [ ] Refactor all `.success()` and `.error()` to `.then()`
   - [ ] Remove `$q.defer()` patterns
   - [ ] Run all tests to verify upgrade
   - [ ] Commit and push

### Questions to Address Before Starting

1. **Team Capacity**: How many developers? Full-time or part-time?
2. **Timeline Flexibility**: Hard deadline or can extend to 26 weeks if needed?
3. **User Impact**: Can we do staged rollout or beta testing?
4. **Third-party Integrations**: Any other APIs or services to consider?
5. **Browser Support**: Minimum browser versions? IE11 support needed? (hope not!)
6. **Deployment Strategy**: How will we deploy? Docker? Cloud platform?
7. **Monitoring**: Do we have error tracking (Sentry, Rollbar) for production?

---

## Additional Resources

### Documentation
- [Angular Official Upgrade Guide](https://angular.io/guide/upgrade)
- [ngUpgrade API Documentation](https://angular.io/api/upgrade)
- [Angular CLI Documentation](https://angular.io/cli)
- [Quill.js Documentation](https://quilljs.com/docs/quickstart/)
- [Cypress Documentation](https://docs.cypress.io/)

### Tools
- [Angular CLI](https://angular.io/cli)
- [Angular Update Guide](https://update.angular.io/)
- [ngMigration Assistant](https://github.com/angular/ngMigration-Assistant)
- [Webpack Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

### Community
- [Angular Discord](https://discord.gg/angular)
- [Angular Stack Overflow](https://stackoverflow.com/questions/tagged/angular)
- [Angular Reddit](https://www.reddit.com/r/Angular2/)

---

## Appendix A: File Structure Comparison

### Before (AngularJS)
```
recipe-web/
├── app/
│   ├── recipe-lib/
│   │   ├── app.js
│   │   ├── home/
│   │   │   ├── home.js
│   │   │   └── home.html
│   │   ├── recipe/
│   │   │   ├── recipe.js
│   │   │   ├── recipe.html
│   │   │   └── recipe-service.js
│   │   ├── user/
│   │   │   ├── user.js
│   │   │   └── user.html
│   │   └── ...
│   ├── bower_components/
│   └── index.html
├── bower.json
├── karma.conf.js
├── package.json
└── node-app.js
```

### After (Angular 18)
```
recipe-web/
├── src/
│   ├── app/
│   │   ├── app.module.ts
│   │   ├── app.component.ts
│   │   ├── app-routing.module.ts
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── recipe.service.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── recipe-book.service.ts
│   │   │   │   ├── image-upload.service.ts
│   │   │   │   └── external-navigation.service.ts
│   │   │   ├── interceptors/
│   │   │   │   └── user-header.interceptor.ts
│   │   │   └── guards/
│   │   │       └── auth.guard.ts
│   │   ├── shared/
│   │   │   ├── shared.module.ts
│   │   │   └── components/
│   │   │       └── navbar/
│   │   │           ├── navbar.component.ts
│   │   │           ├── navbar.component.html
│   │   │           └── navbar.component.css
│   │   └── features/
│   │       ├── home/
│   │       │   ├── home.component.ts
│   │       │   ├── home.component.html
│   │       │   └── home.component.css
│   │       ├── recipe/
│   │       │   ├── recipe.module.ts
│   │       │   ├── recipe-card/
│   │       │   ├── view-recipe/
│   │       │   └── new-recipe/
│   │       ├── search/
│   │       │   ├── search.module.ts
│   │       │   ├── search.component.ts
│   │       │   ├── search.component.html
│   │       │   └── search.component.css
│   │       ├── recipe-book/
│   │       │   ├── recipe-book.component.ts
│   │       │   ├── recipe-book.component.html
│   │       │   └── recipe-book.component.css
│   │       └── user/
│   │           ├── user.component.ts
│   │           ├── user.component.html
│   │           └── user.component.css
│   ├── assets/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── index.html
├── cypress/
│   ├── e2e/
│   │   ├── user-flow.cy.ts
│   │   └── recipe-flow.cy.ts
│   └── support/
├── angular.json
├── tsconfig.json
├── package.json
├── proxy.conf.json
├── karma.conf.js
└── node-app.js
```

---

## Appendix B: Dependency Mapping

| AngularJS Dependency | Angular 18 Replacement | Notes |
|---------------------|------------------------|-------|
| angular 1.4.14 | @angular/core 18.x | Complete rewrite |
| angular-route | @angular/router | Different API |
| angular-cookies | localStorage + Angular services | No direct replacement needed |
| ng-file-upload | HttpClient + FormData | Native HTML5 |
| ng-img-crop | Not needed | Removed feature or find Angular alternative |
| angular-trix | ngx-quill (Quill.js) | Trix not Angular-compatible |
| underscore | Native JavaScript | ES6+ array methods |
| jQuery | Angular + native JS | @angular/cdk if needed |
| Bootstrap 4 | Bootstrap 4 or 5 | 5 is jQuery-free |

---

## Appendix C: Code Comparison Examples

### HTTP Requests

**AngularJS:**
```javascript
$http.get('/api/recipe/' + id)
  .success(function(data) {
    $scope.recipe = data;
  })
  .error(function(err) {
    console.error(err);
  });
```

**Angular:**
```typescript
this.http.get<Recipe>(`/api/recipe/${id}`)
  .subscribe({
    next: (recipe) => {
      this.recipe = recipe;
    },
    error: (err) => {
      console.error(err);
    }
  });
```

### Component Definition

**AngularJS Controller:**
```javascript
angular.module('recipe')
  .controller('HomeCtrl', ['$scope', 'userService', '$location',
    function($scope, userService, $location) {
      $scope.user = userService.getLoggedInUser();

      $scope.navigateToSearch = function() {
        $location.path('/search');
      };
    }
  ]);
```

**Angular Component:**
```typescript
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  user: User | null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.user = this.userService.getLoggedInUser();
  }

  ngOnInit(): void {}

  navigateToSearch(): void {
    this.router.navigate(['/search']);
  }
}
```

### Service Definition

**AngularJS Service:**
```javascript
angular.module('recipe')
  .service('recipeService', ['$http', '$q', function($http, $q) {
    this.findRecipe = function(id) {
      var deferred = $q.defer();
      $http.get('/api/recipe/' + id)
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    };
  }]);
```

**Angular Service:**
```typescript
@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = '/api/recipe';

  constructor(private http: HttpClient) {}

  findRecipe(recipeId: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${recipeId}`);
  }
}
```

---

**End of Migration Plan**

This comprehensive plan provides a detailed, actionable roadmap for migrating from AngularJS 1.4.14 to Angular 18 with realistic timelines, risk mitigation strategies, and concrete implementation steps. Each phase builds on the previous while maintaining functionality throughout the entire migration process.
