import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes, UrlHandlingStrategy, UrlTree } from '@angular/router';

// Custom URL handling strategy for hybrid routing
// This allows Angular and AngularJS routers to coexist
@Injectable()
export class Ng1Ng2UrlHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url: UrlTree): boolean {
    // Initially, let AngularJS handle all routes
    // As we migrate components to Angular, we'll add them here
    // Example: return url.toString().startsWith('/angular-route');
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
  // Initially empty - AngularJS handles all routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule],
  providers: [
    { provide: UrlHandlingStrategy, useClass: Ng1Ng2UrlHandlingStrategy }
  ]
})
export class AppRoutingModule { }
