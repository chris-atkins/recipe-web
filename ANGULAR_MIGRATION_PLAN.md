# AngularJS 1.4 to Angular 18 Migration Plan

## Executive Summary

This document outlines a detailed, phased approach to migrate the Recipe Connection application from **AngularJS 1.4.14** to **Angular 18** using the **ngUpgrade hybrid approach**.

**Current State:**
- AngularJS 1.4.14 (2015)
- 21 JavaScript source files (~3,300 LOC)
- 14 controllers, 6 directives, 6 services
- No bundler (direct script tags)
- Bower for dependencies
- Karma/Jasmine/Protractor for testing

**Migration Strategy:** Incremental hybrid migration using `@angular/upgrade`

**Estimated Timeline:** 16-20 weeks (4-5 months)

---

## Phase 0: Preparation & Setup (Weeks 1-2)

### Objectives
- Modernize AngularJS to latest 1.x version
- Add TypeScript support
- Set up modern build tooling
- Establish dual build system

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

#### Week 2: Build System Setup

**2.1 Install Angular CLI**
```bash
npm install -g @angular/cli@latest
ng new recipe-web-ng --routing --style=css --skip-git
```

**2.2 Configure TypeScript for AngularJS**
```bash
npm install --save-dev typescript @types/angular @types/angular-route @types/angular-cookies
```

Create `tsconfig.angularjs.json`:
```json
{
  "compilerOptions": {
    "target": "ES5",
    "module": "commonjs",
    "lib": ["es2015", "dom"],
    "allowJs": true,
    "checkJs": false,
    "outDir": "./dist-angularjs",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["app/recipe-lib/**/*"],
  "exclude": ["node_modules", "**/*.spec.js"]
}
```

**2.3 Set Up Webpack for AngularJS**

Install dependencies:
```bash
npm install --save-dev webpack webpack-cli webpack-dev-server \
  html-webpack-plugin clean-webpack-plugin \
  ts-loader css-loader style-loader file-loader
```

Create `webpack.angularjs.config.js`:
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './app/recipe-lib/app.js',
  output: {
    path: path.resolve(__dirname, 'dist-angularjs'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.html$/,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/index.html'
    })
  ],
  devServer: {
    contentBase: './dist-angularjs',
    port: 8000,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
};
```

**2.4 Migrate from Bower to npm**

Move all Bower dependencies to package.json:
```bash
npm install --save angular@1.8.3 angular-route angular-cookies \
  jquery@3.3.1 bootstrap@4.0.0 underscore \
  ng-file-upload trix
```

**2.5 Run All Tests**

Ensure everything still works:
```bash
npm run test-single-run
npm run protractor
```

**Deliverables:**
- AngularJS 1.8.3 running with modernized promises
- TypeScript configured
- Webpack bundling working
- All tests passing
- No Bower dependencies

---

## Phase 1: Angular Setup & Hybrid Bootstrap (Weeks 3-4)

### Objectives
- Install Angular 18
- Set up ngUpgrade
- Create hybrid bootstrap
- Run AngularJS and Angular side-by-side

### Tasks

#### Week 3: Angular Installation

**3.1 Install Angular Dependencies**
```bash
cd /Users/chrisatkins/workspace/recipe-web
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

**3.2 Create Angular Module Structure**
```
src/
  app/
    app.module.ts          # Root Angular module
    app.component.ts       # Root component
    app-routing.module.ts  # Angular routing
    core/                  # Core services
      services/
        recipe.service.ts
        user.service.ts
        recipe-book.service.ts
    shared/               # Shared components
      components/
      directives/
      pipes/
    features/            # Feature modules
      home/
      recipe/
      search/
      user/
```

**3.3 Create Hybrid Bootstrap**

Create `src/app/app.module.ts`:
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    UpgradeModule
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

Create `src/main.ts`:
```typescript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

**3.4 Update AngularJS to Support Hybrid**

Modify `app/recipe-lib/app.js`:
```javascript
// Enable strictDi for better Angular compatibility
angular.module('recipe', [
  'ngRoute',
  'ngCookies',
  // ... other modules
])
.config(['$locationProvider', function($locationProvider) {
  // Use PathLocationStrategy compatible with Angular router
  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');
}]);
```

#### Week 4: Hybrid Testing & Validation

**4.1 Configure Angular Testing**
```bash
npm install --save-dev @angular/cli \
  @angular-devkit/build-angular \
  jasmine-core karma karma-jasmine \
  karma-chrome-launcher karma-jasmine-html-reporter
```

**4.2 Update package.json scripts**
```json
{
  "scripts": {
    "ng": "ng",
    "start:ng": "ng serve --proxy-config proxy.conf.json",
    "start:ngjs": "webpack serve --config webpack.angularjs.config.js",
    "build:ng": "ng build",
    "test:ng": "ng test",
    "test:ngjs": "karma start karma.conf.js",
    "e2e": "ng e2e"
  }
}
```

**4.3 Create Proxy Configuration**

Create `proxy.conf.json`:
```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```

**4.4 Verify Hybrid Bootstrap**
- Start backend: `node node-app.js`
- Start Angular: `npm run start:ng`
- Verify AngularJS app still works
- Check console for errors

**Deliverables:**
- Angular 18 installed and configured
- Hybrid app bootstraps successfully
- Both AngularJS and Angular running together
- All existing functionality works

---

## Phase 2: Service Layer Migration (Weeks 5-8)

### Objectives
- Migrate all services to Angular
- Make Angular services available to AngularJS
- Update tests

### Migration Priority
1. **recipeService** - Core functionality, widely used
2. **userService** - Authentication, session management
3. **recipeBookService** - Depends on userService
4. **externalNavigationService** - Simple, standalone
5. **routeHistory** - Can be replaced with Angular Router

### Week 5-6: Core Services

#### 5.1 Migrate recipeService

Create `src/app/core/services/recipe.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Recipe {
  recipeId: string;
  recipeName: string;
  ingredients: string;
  instructions: string;
  imageUrl?: string;
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
    return this.http.post<Recipe>(this.apiUrl, recipe);
  }

  searchRecipes(searchString?: string): Observable<Recipe[]> {
    const params = searchString ? { searchString } : {};
    return this.http.get<Recipe[]>(this.apiUrl, { params });
  }

  allRecipesInUserBook(userId: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.apiUrl, {
      params: { recipeBook: userId }
    });
  }
}
```

**5.2 Downgrade for AngularJS Use**

Create `src/app/core/services/recipe.service.adapter.ts`:
```typescript
import { RecipeService } from './recipe.service';

// Adapter to make Angular service work in AngularJS
export function recipeServiceFactory(i: any) {
  return i.get('RecipeService');
}

export const recipeServiceProvider = {
  provide: 'recipeService',
  useFactory: recipeServiceFactory,
  deps: ['$injector']
};
```

In `app.module.ts`:
```typescript
import { downgradeInjectable } from '@angular/upgrade/static';
import { RecipeService } from './core/services/recipe.service';

// In AngularJS module
declare const angular: any;
angular.module('recipe')
  .factory('recipeService', downgradeInjectable(RecipeService));
```

**5.3 Update AngularJS Controllers**

No changes needed! The downgraded service works exactly like the old one.

#### 5.4 Migrate userService

Create `src/app/core/services/user.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
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
  private userCookieKey = 'myrecipeconnection.com.usersLoggedInFromThisBrowser';
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<User | null>(null);

  public loggedIn$ = this.loggedInSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeUser();
  }

  private initializeUser(): void {
    const userJson = localStorage.getItem(this.userCookieKey);
    if (userJson) {
      const user = JSON.parse(userJson);
      this.userSubject.next(user);
      this.loggedInSubject.next(true);
    }
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }

  getLoggedInUser(): User | null {
    return this.userSubject.value;
  }

  logIn(email: string): Observable<User> {
    return this.http.get<User>(`/api/user?email=${email}`)
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
    localStorage.removeItem(this.userCookieKey);
    this.userSubject.next(null);
    this.loggedInSubject.next(false);
  }

  private handleLogin(user: User): void {
    this.userSubject.next(user);
    this.loggedInSubject.next(true);
    localStorage.setItem(this.userCookieKey, JSON.stringify(user));
  }

  performExternalLogin(): Observable<User | null> {
    const googleAuthJson = localStorage.getItem('RecipeConnectionGoogleAuth');
    if (!googleAuthJson) {
      return of(null);
    }
    const googleAuthUser = JSON.parse(googleAuthJson);
    return this.googleLogIn(googleAuthUser.userName, googleAuthUser.userEmail);
  }

  private googleLogIn(name: string, email: string): Observable<User> {
    return this.http.get<User>(`/api/user?email=${email}`)
      .pipe(
        tap(user => this.handleLogin(user)),
        catchError(() => this.signUp(name, email))
      );
  }
}
```

**Key Changes:**
- Replaced `$cookies` with `localStorage` (more modern)
- Added RxJS observables for reactive state
- Removed callback-based `.success()` and `.error()`
- Type-safe with TypeScript interfaces

**5.5 Create HTTP Interceptor**

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

    if (user) {
      const cloned = req.clone({
        headers: req.headers.set('RequestingUser', user.userId)
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}
```

Register in `app.module.ts`:
```typescript
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { UserHeaderInterceptor } from './core/interceptors/user-header.interceptor';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    UpgradeModule
  ],
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

### Week 7-8: Supporting Services

#### 7.1 Migrate recipeBookService

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

**7.2 Update Service Tests**

Create `src/app/core/services/recipe.service.spec.ts`:
```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecipeService } from './recipe.service';

describe('RecipeService', () => {
  let service: RecipeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecipeService]
    });
    service = TestBed.inject(RecipeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch a recipe by ID', () => {
    const mockRecipe = {
      recipeId: '123',
      recipeName: 'Test Recipe',
      ingredients: 'Test ingredients',
      instructions: 'Test instructions'
    };

    service.findRecipe('123').subscribe(recipe => {
      expect(recipe).toEqual(mockRecipe);
    });

    const req = httpMock.expectOne('/api/recipe/123');
    expect(req.request.method).toBe('GET');
    req.flush(mockRecipe);
  });

  it('should save a recipe', () => {
    const newRecipe = {
      recipeName: 'New Recipe',
      ingredients: 'New ingredients',
      instructions: 'New instructions'
    };

    service.saveRecipe(newRecipe as any).subscribe();

    const req = httpMock.expectOne('/api/recipe');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newRecipe);
  });
});
```

**Deliverables:**
- All 6 services migrated to Angular
- Services downgraded and available to AngularJS
- HTTP interceptor replacing AngularJS interceptor
- Unit tests for all Angular services
- AngularJS app still fully functional

---

## Phase 3: Component Migration (Weeks 9-14)

### Objectives
- Convert AngularJS controllers to Angular components
- Convert AngularJS directives to Angular components
- Set up routing with both routers side-by-side
- Gradually replace views

### Migration Order (by business value)

1. **Navbar** - Visible on all pages, good first component
2. **Home** - Landing page, high visibility
3. **Recipe Display (recipeElement)** - Core functionality
4. **Search** - Important feature
5. **View Recipe** - Recipe detail page
6. **New Recipe** - Recipe creation
7. **Recipe Book** - User's collection
8. **Image Upload** - Supporting feature
9. **View1/View2** - Remove (legacy)

### Week 9-10: Foundation Components

#### 9.1 Migrate Navbar

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
          <a class="nav-link" (click)="navigateToRecipeBook()">My Recipes</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/new-recipe">Add Recipe</a>
        </li>
        <li class="nav-item">
          <span class="nav-link">{{ (user$ | async)?.userName }}</span>
        </li>
        <li class="nav-item">
          <a class="nav-link" (click)="logOut()">Log Out</a>
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

**Key improvements:**
- Uses RxJS observables with async pipe
- Type-safe with interfaces
- Reactive to user state changes
- Clean separation of template and logic

#### 9.2 Set Up Dual Routing

Update `src/app/app-routing.module.ts`:
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlHandlingStrategy, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';

// Custom URL handling strategy for hybrid routing
@Injectable()
export class Ng1Ng2UrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url: UrlTree): boolean {
    // Process Angular routes
    return url.toString().startsWith('/home') ||
           url.toString().startsWith('/search') ||
           url.toString().startsWith('/recipe') ||
           url.toString().startsWith('/user') ||
           url.toString() === '/';
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
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    { provide: UrlHandlingStrategy, useClass: Ng1Ng2UrlHandlingStrategy }
  ]
})
export class AppRoutingModule { }
```

#### 9.3 Downgrade Navbar for AngularJS

In `app.module.ts`:
```typescript
import { downgradeComponent } from '@angular/upgrade/static';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

angular.module('recipe')
  .directive('appNavbar', downgradeComponent({
    component: NavbarComponent
  }));
```

Update AngularJS template to use Angular navbar:
```html
<!-- In AngularJS views, replace old navbar with: -->
<app-navbar></app-navbar>
```

### Week 11-12: Core Feature Components

#### 11.1 Migrate Home Component

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

Add route in `app-routing.module.ts`:
```typescript
import { HomeComponent } from './features/home/home.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent }
];
```

#### 11.2 Migrate Recipe Display Component

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
  @Output() addToBook = new EventEmitter<string>();
  @Output() viewRecipe = new EventEmitter<string>();

  onAddToBook(): void {
    this.addToBook.emit(this.recipe.recipeId);
  }

  onViewRecipe(): void {
    this.viewRecipe.emit(this.recipe.recipeId);
  }
}
```

Template (`recipe-card.component.html`):
```html
<div class="card recipe-card">
  <img
    *ngIf="recipe.imageUrl"
    [src]="recipe.imageUrl"
    class="card-img-top"
    [alt]="recipe.recipeName">

  <div class="card-body">
    <h5 class="card-title">{{ recipe.recipeName }}</h5>

    <button
      class="btn btn-primary"
      (click)="onViewRecipe()">
      View Recipe
    </button>

    <button
      *ngIf="showAddButton"
      class="btn btn-secondary ml-2"
      (click)="onAddToBook()">
      Add to My Recipes
    </button>
  </div>
</div>
```

#### 11.3 Migrate Search Component

Create `src/app/features/search/search.component.ts`:
```typescript
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs/operators';
import { RecipeService, Recipe } from '../../core/services/recipe.service';
import { RecipeBookService } from '../../core/services/recipe-book.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchControl = new FormControl('');
  recipes: Recipe[] = [];
  loading = false;

  constructor(
    private recipeService: RecipeService,
    private recipeBookService: RecipeBookService,
    private router: Router
  ) {}

  ngOnInit(): void {
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
      // Show success message
      console.log('Added to recipe book');
    });
  }

  viewRecipe(recipeId: string): void {
    this.router.navigate(['/view-recipe', recipeId]);
  }
}
```

Template:
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

  <div *ngIf="loading" class="text-center">
    <div class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>

  <div class="row">
    <div class="col-md-4" *ngFor="let recipe of recipes">
      <app-recipe-card
        [recipe]="recipe"
        [showAddButton]="true"
        (addToBook)="addToRecipeBook($event)"
        (viewRecipe)="viewRecipe($event)">
      </app-recipe-card>
    </div>
  </div>
</div>
```

**Key improvements:**
- Reactive forms with FormControl
- Debounced search (better UX, fewer API calls)
- Loading states
- RxJS operators for clean async handling

### Week 13-14: Remaining Components

Continue migrating:
- **View Recipe** component
- **New Recipe** component (with Trix editor integration)
- **Recipe Book** component
- **Image Upload** modal/component
- **User/Login** component

Pattern for each:
1. Create Angular component
2. Add route
3. Write tests
4. Remove AngularJS controller
5. Update links/navigation

**Deliverables:**
- All controllers converted to components
- All directives converted to components
- Dual routing working
- Tests for all components
- Progressive replacement of AngularJS views

---

## Phase 4: Routing & Navigation (Week 15)

### Objectives
- Complete migration to Angular Router
- Remove AngularJS routing
- Clean up dual-router setup

### Tasks

#### 15.1 Complete Route Migration

Final `app-routing.module.ts`:
```typescript
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'recipe/:id', component: ViewRecipeComponent },
  { path: 'new-recipe', component: NewRecipeComponent },
  { path: 'recipe-book/:userId', component: RecipeBookComponent },
  { path: 'user', component: UserComponent },
  { path: '**', redirectTo: '/home' }  // 404 redirect
];
```

#### 15.2 Remove AngularJS Router

Remove from `app.js`:
```javascript
// Remove ngRoute module
angular.module('recipe', [
  'ngCookies',  // Keep
  // 'ngRoute',  // REMOVE
  // ...
])
// .config(['$routeProvider', ...])  // REMOVE
```

#### 15.3 Remove URL Handling Strategy

In `app-routing.module.ts`:
```typescript
// Remove Ng1Ng2UrlHandlingStrategy
// Remove provider
```

#### 15.4 Update App Bootstrap

In `app.module.ts`:
```typescript
@NgModule({
  // Remove UpgradeModule
})
export class AppModule {
  // Remove ngDoBootstrap
  // Normal Angular bootstrap
}
```

In `main.ts`:
```typescript
// No changes needed - standard Angular bootstrap
```

**Deliverables:**
- 100% Angular routing
- AngularJS router removed
- All navigation working
- Clean URLs with HTML5 mode

---

## Phase 5: Cleanup & Optimization (Week 16)

### Objectives
- Remove all AngularJS code
- Remove AngularJS dependencies
- Optimize bundle size
- Final testing

### Tasks

#### 16.1 Remove AngularJS Files

Delete:
```
app/recipe-lib/              # All AngularJS code
app/bower_components/        # All Bower components
bower.json                   # Bower config
webpack.angularjs.config.js  # AngularJS webpack config
```

#### 16.2 Remove AngularJS Dependencies

Update `package.json`:
```bash
npm uninstall angular angular-route angular-cookies \
  @angular/upgrade bower \
  karma-ng-html2js-preprocessor
```

#### 16.3 Update Build Configuration

Remove hybrid build scripts from `package.json`:
```json
{
  "scripts": {
    "start": "ng serve",
    "build": "ng build --configuration production",
    "test": "ng test",
    "lint": "ng lint"
  }
}
```

#### 16.4 Bundle Optimization

Enable production optimizations in `angular.json`:
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
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
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

#### 16.5 Replace jQuery and Underscore

Replace jQuery usage:
- Use Angular's Renderer2 for DOM manipulation
- Use @angular/cdk if needed for complex UI

Replace Underscore:
- Use native JavaScript array methods
- Use Lodash-es (tree-shakeable) if needed

#### 16.6 Migrate to Modern Bootstrap

Upgrade Bootstrap 4 → 5 and use ng-bootstrap:
```bash
npm install bootstrap@5 @ng-bootstrap/ng-bootstrap
```

#### 16.7 Update Testing

Migrate Protractor to Cypress:
```bash
npm install --save-dev cypress @cypress/schematic
ng add @cypress/schematic
```

Convert E2E tests from Protractor to Cypress format.

#### 16.8 Final Testing Suite

Run complete test suite:
```bash
npm run lint              # Linting
npm test                  # Unit tests
npm run e2e               # E2E tests with Cypress
npm run build             # Production build
```

**Deliverables:**
- Zero AngularJS code remaining
- Optimized bundle size
- All tests passing
- Production-ready Angular 18 app

---

## Testing Strategy Throughout Migration

### Unit Testing
- Write tests for each new Angular service/component
- Maintain AngularJS tests until component is migrated
- Aim for 80%+ code coverage

### Integration Testing
- Test service downgrades work in AngularJS
- Test component downgrades work in AngularJS
- Test Angular and AngularJS services interact correctly

### E2E Testing
- Keep existing Protractor tests running
- Add Cypress tests for migrated features
- Remove Protractor tests as features complete

### Manual Testing Checklist
After each phase, test:
- [ ] User login/logout
- [ ] Recipe search
- [ ] View recipe details
- [ ] Create new recipe
- [ ] Add/remove from recipe book
- [ ] Image upload
- [ ] Navigation between all pages
- [ ] Browser back/forward buttons
- [ ] Page refresh maintains state

---

## Risk Mitigation

### High-Risk Areas

**1. User Session Management**
- Risk: Users logged out unexpectedly
- Mitigation: Thorough testing of userService migration; keep cookie/localStorage in sync

**2. Image Upload**
- Risk: File upload breaks during migration
- Mitigation: Migrate image upload component carefully; test with large files

**3. Rich Text Editor (Trix)**
- Risk: Trix may not work well with Angular
- Mitigation: Research Angular Trix integration early; consider alternatives (Quill, CKEditor)

**4. Routing Conflicts**
- Risk: Angular and AngularJS routers conflict
- Mitigation: Careful URL handling strategy; thorough routing tests

### Rollback Plan

Each phase should be in its own Git branch:
```
feature/phase0-preparation
feature/phase1-hybrid-setup
feature/phase2-services
feature/phase3-components
feature/phase4-routing
feature/phase5-cleanup
```

If issues arise, can rollback to previous phase.

---

## Success Metrics

### Technical Metrics
- [ ] Zero AngularJS dependencies
- [ ] Bundle size < 1MB (production)
- [ ] Lighthouse score > 90
- [ ] Test coverage > 80%
- [ ] Zero console errors
- [ ] All E2E tests passing

### Business Metrics
- [ ] All features working
- [ ] No user-reported bugs from migration
- [ ] Page load time < 2s
- [ ] No regression in user workflows

---

## Timeline Summary

| Phase | Weeks | Key Deliverables |
|-------|-------|------------------|
| 0: Preparation | 1-2 | AngularJS 1.8, TypeScript, Webpack |
| 1: Hybrid Setup | 3-4 | Angular 18 installed, hybrid bootstrap |
| 2: Services | 5-8 | All services in Angular, downgraded |
| 3: Components | 9-14 | All components migrated |
| 4: Routing | 15 | Pure Angular routing |
| 5: Cleanup | 16 | Production-ready Angular app |

**Total: 16-20 weeks**

---

## Next Steps

### Immediate Actions

1. **Review and Approve Plan**
   - Stakeholder review
   - Adjust timeline if needed
   - Assign team members

2. **Set Up Development Environment**
   - Create feature branch: `git checkout -b feature/angular-migration`
   - Back up current production
   - Set up staging environment

3. **Begin Phase 0**
   - Install AngularJS 1.8.3
   - Refactor promise handling
   - Set up TypeScript
   - Configure Webpack

### Questions to Address

1. **Team Capacity**: How many developers available?
2. **Timeline Flexibility**: Hard deadline or can extend?
3. **User Impact**: Can we do beta testing?
4. **Third-party Integrations**: Any APIs or services to update?
5. **Browser Support**: What browsers must be supported?

---

## Additional Resources

### Documentation
- [Angular Upgrade Guide](https://angular.io/guide/upgrade)
- [ngUpgrade Documentation](https://angular.io/api/upgrade)
- [AngularJS to Angular Migration Guide](https://angular.io/guide/upgrade-setup)

### Tools
- [Angular CLI](https://angular.io/cli)
- [Angular Update Guide](https://update.angular.io/)
- [ngMigration Assistant](https://github.com/angular/ngMigration-Assistant)

### Community
- [Angular Discord](https://discord.gg/angular)
- [Angular Stack Overflow](https://stackoverflow.com/questions/tagged/angular)

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
│   │   └── user/
│   │       ├── user.js
│   │       └── user.html
│   ├── bower_components/
│   └── index.html
├── bower.json
└── package.json
```

### After (Angular)
```
recipe-web-ng/
├── src/
│   ├── app/
│   │   ├── app.module.ts
│   │   ├── app.component.ts
│   │   ├── app-routing.module.ts
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── recipe.service.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   └── recipe-book.service.ts
│   │   │   └── interceptors/
│   │   │       └── user-header.interceptor.ts
│   │   ├── shared/
│   │   │   └── components/
│   │   │       └── navbar/
│   │   └── features/
│   │       ├── home/
│   │       ├── recipe/
│   │       ├── search/
│   │       └── user/
│   ├── assets/
│   ├── environments/
│   └── index.html
├── angular.json
├── tsconfig.json
└── package.json
```

---

## Appendix B: Dependency Mapping

| AngularJS Dependency | Angular Replacement |
|---------------------|---------------------|
| angular 1.4.14 | @angular/core 18.x |
| angular-route | @angular/router |
| angular-cookies | localStorage / @angular/common |
| ng-file-upload | @angular/common/http + FormData |
| ng-img-crop | ngx-image-cropper |
| angular-trix | Consider Quill.js with ngx-quill |
| underscore | Native JS / lodash-es |
| jQuery | @angular/cdk + native JS |
| Bootstrap 4 | Bootstrap 5 + @ng-bootstrap/ng-bootstrap |

---

## Appendix C: Code Comparison Examples

### HTTP Requests

**AngularJS:**
```javascript
$http.get('/api/recipe/' + id)
  .success(function(data) {
    return data;
  })
  .error(function(err) {
    console.error(err);
  });
```

**Angular:**
```typescript
this.http.get<Recipe>(`/api/recipe/${id}`)
  .pipe(
    catchError(err => {
      console.error(err);
      return throwError(err);
    })
  )
  .subscribe(data => {
    // Handle data
  });
```

### Component Definition

**AngularJS Controller:**
```javascript
angular.module('recipe')
  .controller('HomeCtrl', ['$scope', 'userService',
    function($scope, userService) {
      $scope.user = userService.getLoggedInUser();

      $scope.doSomething = function() {
        // ...
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

  constructor(private userService: UserService) {
    this.user = this.userService.getLoggedInUser();
  }

  ngOnInit(): void {}

  doSomething(): void {
    // ...
  }
}
```

---

**End of Migration Plan**

This plan provides a comprehensive, actionable roadmap for migrating from AngularJS 1.4.14 to Angular 18. Each phase builds on the previous, minimizing risk while maintaining functionality throughout the migration process.
