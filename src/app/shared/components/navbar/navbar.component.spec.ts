import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { UserService, User } from '../../../core/services/user.service';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let router: Router;

  const mockUser: User = { userId: '123', userName: 'Test User', userEmail: 'test@test.com' };
  let userSubject: BehaviorSubject<User | null>;
  let loggedInSubject: BehaviorSubject<boolean>;

  beforeEach(() => {
    userSubject = new BehaviorSubject<User | null>(null);
    loggedInSubject = new BehaviorSubject<boolean>(false);

    const userServiceSpy = jasmine.createSpyObj('UserService', ['logOut', 'getLoggedInUser', 'isLoggedIn'], {
      user$: userSubject.asObservable(),
      loggedIn$: loggedInSubject.asObservable()
    });
    userServiceSpy.isLoggedIn.and.returnValue(false);

    TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: UserService, useValue: userServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set user$ observable from UserService', (done) => {
    userSubject.next(mockUser);

    component.user$.subscribe(user => {
      expect(user).toEqual(mockUser);
      done();
    });
  });

  it('should set loggedIn$ observable from UserService', (done) => {
    loggedInSubject.next(true);

    component.loggedIn$.subscribe(loggedIn => {
      expect(loggedIn).toBe(true);
      done();
    });
  });

  describe('logOut', () => {
    it('should call userService.logOut()', () => {
      spyOn(router, 'navigate');

      component.logOut();

      expect(userService.logOut).toHaveBeenCalled();
    });

    it('should navigate to /home after logout', () => {
      spyOn(router, 'navigate');

      component.logOut();

      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

  describe('navigateRecipeBook', () => {
    it('should navigate to recipe book when user is logged in', () => {
      spyOn(router, 'navigate');
      userService.getLoggedInUser.and.returnValue(mockUser);

      component.navigateRecipeBook();

      expect(router.navigate).toHaveBeenCalledWith(['/user', '123', 'recipe-book']);
    });

    it('should show alert when user is not logged in', () => {
      userService.getLoggedInUser.and.returnValue(null);

      component.navigateRecipeBook();

      expect(component.alertVisible).toBe(true);
    });
  });
});
