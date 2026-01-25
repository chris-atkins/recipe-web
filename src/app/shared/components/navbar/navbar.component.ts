import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, User } from '../../../core/services/user.service';
import { ExternalNavigationService } from '../../../core/services/external-navigation.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  user$: Observable<User | null>;
  loggedIn$: Observable<boolean>;

  // Login state
  loginHasBeenAttempted = false;
  isLoggedIn = false;
  loginMessage = 'Log In';
  alertVisible = false;
  email = '';
  name = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private externalNavigationService: ExternalNavigationService
  ) {
    this.user$ = this.userService.user$;
    this.loggedIn$ = this.userService.loggedIn$;
  }

  ngOnInit(): void {
    this.updateUserStatus();
    this.handleExternalLoginIfUserIsAttemptingOne();
  }

  // Navigation methods
  navigateHome(): void {
    this.router.navigate(['/home']);
  }

  navigateBrowse(): void {
    this.router.navigate(['/search-recipes']);
  }

  navigateSave(): void {
    if (this.userService.isLoggedIn()) {
      // Use AngularJS route for new-recipe (not yet migrated)
      window.location.hash = '#/new-recipe';
    } else {
      this.setAlertVisible(true);
    }
  }

  navigateRecipeBook(): void {
    const user = this.userService.getLoggedInUser();
    if (user) {
      // Use AngularJS route for recipe-book (not yet migrated)
      window.location.hash = `#/user/${user.userId}/recipe-book`;
    } else {
      this.setAlertVisible(true);
    }
  }

  // Login/logout methods
  loginClicked(): void {
    this.setAlertVisible(false);
  }

  googleAuthClicked(): void {
    const currentPath = this.router.url;
    this.externalNavigationService.navigateTo('/auth/google?callbackPath=' + currentPath);
  }

  logIn(event: Event): void {
    event.stopImmediatePropagation();
    this.loginHasBeenAttempted = true;
    this.userService.logIn(this.email).then(() => {
      this.updateUserStatus();
      if (this.isLoggedIn) {
        // Trigger parent click to close Bootstrap dropdown
        (event.target as HTMLElement)?.parentElement?.click();
      }
    });
  }

  signUp(): void {
    this.userService.signUp(this.name, this.email).then(() => {
      this.updateUserStatus();
    });
  }

  logOut(): void {
    this.userService.logOut();
    this.updateUserStatus();
    this.resetLogin();
    this.router.navigate(['/home']);
  }

  // Login state helper methods
  shouldShowLogIn(): boolean {
    return !this.isLoggedIn && !this.loginHasBeenAttempted;
  }

  shouldShowSignUp(): boolean {
    return !this.isLoggedIn && this.loginHasBeenAttempted;
  }

  setAlertVisible(value: boolean): void {
    this.alertVisible = value;
  }

  private updateUserStatus(): void {
    const user = this.userService.getLoggedInUser();
    this.isLoggedIn = this.userService.isLoggedIn();
    this.loginMessage = this.buildLoginMessage(user);
  }

  private buildLoginMessage(user: User | null): string {
    if (user && user.userId) {
      return 'Welcome, ' + user.userName;
    } else {
      return 'Log In';
    }
  }

  private resetLogin(): void {
    this.loginHasBeenAttempted = false;
  }

  private handleExternalLoginIfUserIsAttemptingOne(): void {
    if (this.userService.isExternalLoginBeingAttempted()) {
      this.userService.performExternalLogin().then(() => {
        this.updateUserStatus();
      });
    }
  }
}
