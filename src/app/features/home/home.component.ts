import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private userHasClickedLoginSensitiveButton = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  get shouldShowErrorMessage(): boolean {
    return this.userHasClickedLoginSensitiveButton && !this.userService.isLoggedIn();
  }

  hideErrorMessage(): void {
    this.userHasClickedLoginSensitiveButton = false;
  }

  navigateToSearch(): void {
    window.location.hash = '#/search-recipes';
  }

  navigateToSaveNewRecipe(): void {
    this.userHasClickedLoginSensitiveButton = true;
    if (!this.userService.isLoggedIn()) {
      return;
    }
    // Use AngularJS route for new-recipe (not yet migrated)
    window.location.hash = '#/new-recipe';
  }

  navigateToRecipeBook(): void {
    this.userHasClickedLoginSensitiveButton = true;
    if (!this.userService.isLoggedIn()) {
      return;
    }
    const user = this.userService.getLoggedInUser();
    if (user) {
      // Use AngularJS route for recipe-book (not yet migrated)
      window.location.hash = `#/user/${user.userId}/recipe-book`;
    }
  }
}
