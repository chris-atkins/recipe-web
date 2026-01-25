import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { SearchRecipesComponent } from './features/search/search-recipes.component';
import { RecipeBookComponent } from './features/recipe-book/recipe-book.component';
import { ViewRecipeComponent } from './features/view-recipe/view-recipe.component';
import { NewRecipeComponent } from './features/new-recipe/new-recipe.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'search-recipes', component: SearchRecipesComponent },
  { path: 'browse-all-recipes', redirectTo: '/search-recipes', pathMatch: 'full' },
  { path: 'user/:userId/recipe-book', component: RecipeBookComponent },
  { path: 'view-recipe/:recipeId', component: ViewRecipeComponent },
  { path: 'new-recipe', component: NewRecipeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
