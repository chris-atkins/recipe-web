import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule, downgradeInjectable } from '@angular/upgrade/static';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { RecipeService } from './core/services/recipe.service';
import { UserService } from './core/services/user.service';
import { UserHeaderInterceptor } from './core/interceptors/user-header.interceptor';

declare const angular: any;

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
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UserHeaderInterceptor,
      multi: true
    }
  ]
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) {}

  ngDoBootstrap() {
    // Downgrade Angular services for AngularJS use
    angular.module('recipe')
      .factory('recipeService', downgradeInjectable(RecipeService))
      .factory('userService', downgradeInjectable(UserService));

    // Bootstrap AngularJS first within Angular
    this.upgrade.bootstrap(document.body, ['recipe'], { strictDi: true });
  }
}
