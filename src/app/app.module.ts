import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { HomeComponent } from './features/home/home.component';
import { SearchRecipesComponent } from './features/search/search-recipes.component';
import { RecipeBookComponent } from './features/recipe-book/recipe-book.component';
import { ViewRecipeComponent } from './features/view-recipe/view-recipe.component';
import { NewRecipeComponent } from './features/new-recipe/new-recipe.component';
import { QuillModule } from 'ngx-quill';
import { UserHeaderInterceptor } from './core/interceptors/user-header.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchRecipesComponent,
    RecipeBookComponent,
    ViewRecipeComponent,
    NewRecipeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    SharedModule,
    QuillModule.forRoot()
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UserHeaderInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
