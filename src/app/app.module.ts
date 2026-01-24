import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule, downgradeInjectable, downgradeComponent } from '@angular/upgrade/static';
import { setUpLocationSync } from '@angular/router/upgrade';
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
import { RecipeService } from './core/services/recipe.service';
import { UserService } from './core/services/user.service';
import { RecipeBookService } from './core/services/recipe-book.service';
import { ExternalNavigationService } from './core/services/external-navigation.service';
import { UserHeaderInterceptor } from './core/interceptors/user-header.interceptor';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { RecipeCardWallComponent } from './shared/components/recipe-card-wall/recipe-card-wall.component';
import { ImageUploadModalComponent } from './shared/components/image-upload-modal/image-upload-modal.component';

declare const angular: any;

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
    UpgradeModule,
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
  ]
})
export class AppModule {
  constructor(private upgrade: UpgradeModule, private appRef: ApplicationRef) {}

  ngDoBootstrap() {
    // Check if AngularJS is loaded (hybrid mode)
    if (typeof angular !== 'undefined') {
      // Downgrade Angular components for AngularJS use
      angular.module('recipe')
        .directive('appNavbar', downgradeComponent({
          component: NavbarComponent
        }) as any)
        .directive('appRecipeCardWall', downgradeComponent({
          component: RecipeCardWallComponent
        }) as any)
        .directive('appImageUploadModal', downgradeComponent({
          component: ImageUploadModalComponent
        }) as any);

      // Downgrade Angular services for AngularJS use
      angular.module('recipe')
        .factory('recipeService', downgradeInjectable(RecipeService))
        .factory('userService', downgradeInjectable(UserService))
        .factory('recipeBookService', downgradeInjectable(RecipeBookService))
        .factory('externalNavigationService', downgradeInjectable(ExternalNavigationService));

      // Bootstrap AngularJS first within Angular
      this.upgrade.bootstrap(document.body, ['recipe'], { strictDi: true });

      // Sync AngularJS $location with Angular router
      setUpLocationSync(this.upgrade, 'hash');
    }

    // Always bootstrap Angular AppComponent (for both hybrid and standalone modes)
    this.appRef.bootstrap(AppComponent);
  }
}
