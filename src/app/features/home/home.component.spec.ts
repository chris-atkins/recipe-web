import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { UserService } from '../../core/services/user.service';
import { ExternalNavigationService } from '../../core/services/external-navigation.service';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../../shared/shared.module';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let externalNavigationService: jasmine.SpyObj<ExternalNavigationService>;
  let router: Router;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['isLoggedIn', 'getLoggedInUser']);
    const externalNavigationServiceSpy = jasmine.createSpyObj('ExternalNavigationService', ['navigateTo']);

    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [RouterTestingModule, SharedModule],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: ExternalNavigationService, useValue: externalNavigationServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    externalNavigationService = TestBed.inject(ExternalNavigationService) as jasmine.SpyObj<ExternalNavigationService>;
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should redirect to /search when user is logged in', () => {
      userService.isLoggedIn.and.returnValue(true);

      component.ngOnInit();

      expect(externalNavigationService.navigateTo).toHaveBeenCalledWith('/search');
    });

    it('should not redirect when user is not logged in', () => {
      userService.isLoggedIn.and.returnValue(false);

      component.ngOnInit();

      expect(externalNavigationService.navigateTo).not.toHaveBeenCalled();
    });
  });

  describe('navigateToSearch', () => {
    it('should navigate to /search using ExternalNavigationService', () => {
      component.navigateToSearch();

      expect(externalNavigationService.navigateTo).toHaveBeenCalledWith('/search');
    });
  });

  describe('navigateToSaveNewRecipe', () => {
    it('should navigate to /new-recipe using ExternalNavigationService', () => {
      component.navigateToSaveNewRecipe();

      expect(externalNavigationService.navigateTo).toHaveBeenCalledWith('/new-recipe');
    });
  });

  describe('navigateToRecipeBook', () => {
    it('should navigate to recipe book when user is logged in', () => {
      const mockUser = { userId: '123', userName: 'Test User', userEmail: 'test@test.com' };
      userService.getLoggedInUser.and.returnValue(mockUser);

      component.navigateToRecipeBook();

      expect(externalNavigationService.navigateTo).toHaveBeenCalledWith('/recipe-book/123');
    });

    it('should not navigate when user is not logged in', () => {
      userService.getLoggedInUser.and.returnValue(null);

      component.navigateToRecipeBook();

      expect(externalNavigationService.navigateTo).not.toHaveBeenCalled();
    });
  });

  describe('button rendering', () => {
    it('should display 3 navigation card buttons', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.home-nav-button');

      expect(buttons.length).toBe(3);
    });

    it('should render Browse Recipes button with correct text', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const searchButton = compiled.querySelector('#search-button');

      expect(searchButton).toBeTruthy();
      expect(searchButton.querySelector('.card-title').textContent).toContain('Browse Recipes');
      expect(searchButton.querySelector('.card-text').textContent).toContain('Look through all the recipes');
    });

    it('should render Save New Recipe button with correct text', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const saveButton = compiled.querySelector('#save-button');

      expect(saveButton).toBeTruthy();
      expect(saveButton.querySelector('.card-title').textContent).toContain('Save New Recipe');
      expect(saveButton.querySelector('.card-text').textContent).toContain('Add your own recipe');
    });

    it('should render My Recipe Book button with correct text', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const recipeBookButton = compiled.querySelector('#recipe-book-button');

      expect(recipeBookButton).toBeTruthy();
      expect(recipeBookButton.querySelector('.card-title').textContent).toContain('My Recipe Book');
      expect(recipeBookButton.querySelector('.card-text').textContent).toContain('Browse the list of recipes');
    });
  });

  describe('image rendering', () => {
    it('should display 4 recipe images', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const images = compiled.querySelectorAll('.recipe-image-row img');

      expect(images.length).toBe(4);
    });

    it('should render images with correct src attributes', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const images = compiled.querySelectorAll('.recipe-image-row img');

      expect(images[0].getAttribute('src')).toBe('recipe-lib/images/pexels-photo-25273.jpg');
      expect(images[1].getAttribute('src')).toBe('recipe-lib/images/food-salad-healthy-lunch.jpg');
      expect(images[2].getAttribute('src')).toBe('recipe-lib/images/pexels-photo-196643.jpeg');
      expect(images[3].getAttribute('src')).toBe('recipe-lib/images/pexels-photo-64208.jpeg');
    });

    it('should render images with img-fluid class', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const images = compiled.querySelectorAll('.recipe-image-row img');

      images.forEach((img: Element) => {
        expect(img.classList.contains('img-fluid')).toBe(true);
      });
    });

    it('should render images in col-3 containers', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const imageHolders = compiled.querySelectorAll('.recipe-image-holder');

      expect(imageHolders.length).toBe(4);
      imageHolders.forEach((holder: Element) => {
        expect(holder.classList.contains('col-3')).toBe(true);
      });
    });
  });
});
