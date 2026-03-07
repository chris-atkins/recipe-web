import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { VERSION } from '../../version';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  version = VERSION;
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
    this.router.navigate(['/search-recipes']);
  }

  navigateToSaveNewRecipe(): void {
    this.userHasClickedLoginSensitiveButton = true;
    if (!this.userService.isLoggedIn()) {
      return;
    }
    this.router.navigate(['/new-recipe']);
  }

  navigateToRecipeBook(): void {
    this.userHasClickedLoginSensitiveButton = true;
    if (!this.userService.isLoggedIn()) {
      return;
    }
    const user = this.userService.getLoggedInUser();
    if (user) {
      this.router.navigate(['/user', user.userId, 'recipe-book']);
    }
  }
}
