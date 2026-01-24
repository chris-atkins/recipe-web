import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes, UrlHandlingStrategy, UrlTree } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { SearchRecipesComponent } from './features/search/search-recipes.component';
import { RecipeBookComponent } from './features/recipe-book/recipe-book.component';
import { ViewRecipeComponent } from './features/view-recipe/view-recipe.component';

// Custom URL handling strategy for hybrid routing
// This allows Angular and AngularJS routers to coexist
@Injectable()
export class Ng1Ng2UrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url: UrlTree): boolean {
    // Angular handles these routes
    const urlString = url.toString();
    return urlString === '/home' ||
           urlString === '/' ||
           urlString === '' ||
           urlString.startsWith('/search-recipes') ||
           urlString.startsWith('/view-recipe/') ||
           /^\/user\/[^/]+\/recipe-book/.test(urlString);
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
  { path: 'home', component: HomeComponent },
  { path: 'search-recipes', component: SearchRecipesComponent },
  { path: 'user/:userId/recipe-book', component: RecipeBookComponent },
  { path: 'view-recipe/:recipeId', component: ViewRecipeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [
    { provide: UrlHandlingStrategy, useClass: Ng1Ng2UrlHandlingStrategy }
  ]
})
export class AppRoutingModule { }
