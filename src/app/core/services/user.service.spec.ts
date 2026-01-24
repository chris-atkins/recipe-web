import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, User } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const USER_COOKIE_KEY = 'myrecipeconnection.com.usersLoggedInFromThisBrowser';
  const GOOGLE_AUTH_KEY = 'RecipeConnectionGoogleAuth';

  // Helper functions to work with cookies in tests
  function setCookie(name: string, value: any): void {
    const jsonValue = JSON.stringify(value);
    document.cookie = `${name}=${encodeURIComponent(jsonValue)}; path=/`;
  }

  function getCookie(name: string): any | null {
    const nameEq = name + '=';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEq) === 0) {
        try {
          return JSON.parse(decodeURIComponent(cookie.substring(nameEq.length)));
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  function deleteCookie(name: string): void {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  function clearAllCookies(): void {
    deleteCookie(USER_COOKIE_KEY);
    deleteCookie(GOOGLE_AUTH_KEY);
  }

  beforeEach(() => {
    clearAllCookies();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    clearAllCookies();
  });

  it('should initialize with no user', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getLoggedInUser()).toBe(null);
  });

  it('should initialize with stored user from cookie', () => {
    const user: User = { userId: '123', userName: 'Test', userEmail: 'test@test.com' };
    setCookie(USER_COOKIE_KEY, user);

    // Create a new TestBed to get a fresh UserService instance that reads from cookie
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    const newService = TestBed.inject(UserService);

    expect(newService.isLoggedIn()).toBe(true);
    expect(newService.getLoggedInUser()).toEqual(user);
  });

  describe('getUserById', () => {
    it('should fetch user by ID from API', (done) => {
      const user: User = { userId: '123', userName: 'Test', userEmail: 'test@test.com' };

      const promise = service.getUserById('123');
      const req = httpMock.expectOne('/api/user/123');
      expect(req.request.method).toBe('GET');
      req.flush(user);

      promise.then(result => {
        expect(result).toEqual(user);
        done();
      });
    });

    it('should reject on error', (done) => {
      const promise = service.getUserById('999');
      const req = httpMock.expectOne('/api/user/999');
      req.flush({}, { status: 404, statusText: 'Not Found' });

      promise.catch(error => {
        expect(error.status).toBe(404);
        done();
      });
    });
  });

  describe('logIn', () => {
    it('should log in user and store in cookie', (done) => {
      const user: User = { userId: '123', userName: 'Test', userEmail: 'test@test.com' };

      const loginPromise = service.logIn('test@test.com');
      const req = httpMock.expectOne('/api/user?email=test%40test.com');
      expect(req.request.method).toBe('GET');
      req.flush(user);

      loginPromise.then(() => {
        expect(service.isLoggedIn()).toBe(true);
        expect(service.getLoggedInUser()).toEqual(user);

        const stored = getCookie(USER_COOKIE_KEY);
        expect(stored).toEqual(user);
        done();
      });
    });

    it('should return empty object on error', (done) => {
      const loginPromise = service.logIn('test@test.com');
      const req = httpMock.expectOne('/api/user?email=test%40test.com');
      req.flush({}, { status: 404, statusText: 'Not Found' });

      loginPromise.then((result) => {
        expect(result).toEqual({ data: {} });
        expect(service.isLoggedIn()).toBe(false);
        done();
      });
    });
  });

  describe('signUp', () => {
    it('should sign up user and store in cookie', (done) => {
      const user: User = { userId: '123', userName: 'Test', userEmail: 'test@test.com' };

      const signUpPromise = service.signUp('Test', 'test@test.com');
      const req = httpMock.expectOne('/api/user');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ userName: 'Test', userEmail: 'test@test.com' });
      req.flush(user);

      signUpPromise.then(() => {
        expect(service.isLoggedIn()).toBe(true);
        expect(service.getLoggedInUser()).toEqual(user);

        const stored = getCookie(USER_COOKIE_KEY);
        expect(stored).toEqual(user);
        done();
      });
    });

    it('should return empty object on error', (done) => {
      const signUpPromise = service.signUp('Test', 'test@test.com');
      const req = httpMock.expectOne('/api/user');
      req.flush({}, { status: 500, statusText: 'Server Error' });

      signUpPromise.then((result) => {
        expect(result).toEqual({ data: {} });
        expect(service.isLoggedIn()).toBe(false);
        done();
      });
    });
  });

  describe('logOut', () => {
    it('should log out and clear cookies', (done) => {
      const user: User = { userId: '123', userName: 'Test', userEmail: 'test@test.com' };
      setCookie(USER_COOKIE_KEY, user);
      setCookie(GOOGLE_AUTH_KEY, { userName: 'Google', userEmail: 'google@test.com' });

      // Manually set logged in state via login
      const loginPromise = service.logIn('test@test.com');
      const req = httpMock.expectOne('/api/user?email=test%40test.com');
      req.flush(user);

      loginPromise.then(() => {
        service.logOut();

        expect(service.isLoggedIn()).toBe(false);
        expect(service.getLoggedInUser()).toBe(null);
        expect(getCookie(USER_COOKIE_KEY)).toBe(null);
        expect(getCookie(GOOGLE_AUTH_KEY)).toBe(null);
        done();
      });
    });
  });

  describe('isExternalLoginBeingAttempted', () => {
    it('should return true if Google auth data exists in cookie', () => {
      setCookie(GOOGLE_AUTH_KEY, { userName: 'Google', userEmail: 'google@test.com' });

      // Need a fresh service to check the cookie
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [UserService]
      });
      const newService = TestBed.inject(UserService);

      expect(newService.isExternalLoginBeingAttempted()).toBe(true);
    });

    it('should return false if no Google auth data exists', () => {
      expect(service.isExternalLoginBeingAttempted()).toBe(false);
    });
  });

  describe('performExternalLogin', () => {
    it('should log in user with Google auth email', (done) => {
      const googleUser: User = { userId: '456', userName: 'Google User', userEmail: 'google@test.com' };
      setCookie(GOOGLE_AUTH_KEY, { userName: 'Google User', userEmail: 'google@test.com' });

      // Need a fresh service to read the cookie
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [UserService]
      });
      const newService = TestBed.inject(UserService);
      const newHttpMock = TestBed.inject(HttpTestingController);

      const loginPromise = newService.performExternalLogin();
      const req = newHttpMock.expectOne('/api/user?email=google%40test.com');
      expect(req.request.method).toBe('GET');
      req.flush(googleUser);

      loginPromise.then(result => {
        expect(newService.isLoggedIn()).toBe(true);
        expect(newService.getLoggedInUser()).toEqual(googleUser);
        newHttpMock.verify();
        done();
      });
    });

    it('should sign up new user if Google auth user does not exist', (done) => {
      const newUser: User = { userId: '555', userName: 'Google User', userEmail: 'google@test.com' };
      setCookie(GOOGLE_AUTH_KEY, { userName: 'Google User', userEmail: 'google@test.com' });

      // Need a fresh service to read the cookie
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [UserService]
      });
      const newService = TestBed.inject(UserService);
      const newHttpMock = TestBed.inject(HttpTestingController);

      const loginPromise = newService.performExternalLogin();
      const req1 = newHttpMock.expectOne('/api/user?email=google%40test.com');
      req1.flush({}, { status: 404, statusText: 'Not Found' });

      // Need to wait for the first request to fail before the signup request is made
      setTimeout(() => {
        const req2 = newHttpMock.expectOne('/api/user');
        expect(req2.request.method).toBe('POST');
        expect(req2.request.body).toEqual({ userName: 'Google User', userEmail: 'google@test.com' });
        req2.flush(newUser);

        loginPromise.then(result => {
          expect(newService.isLoggedIn()).toBe(true);
          expect(newService.getLoggedInUser()).toEqual(newUser);
          newHttpMock.verify();
          done();
        });
      }, 0);
    });

    it('should return empty object if no Google auth cookie exists', (done) => {
      service.performExternalLogin().then(result => {
        expect(result).toEqual({});
        expect(service.isLoggedIn()).toBe(false);
        done();
      });
    });
  });

  describe('Observables', () => {
    it('should emit loggedIn$ changes', (done) => {
      const user: User = { userId: '123', userName: 'Test', userEmail: 'test@test.com' };
      let emitCount = 0;
      const expectedValues = [false, true];

      service.loggedIn$.subscribe(loggedIn => {
        expect(loggedIn).toBe(expectedValues[emitCount]);
        emitCount++;
        if (emitCount === 2) {
          done();
        }
      });

      const loginPromise = service.logIn('test@test.com');
      const req = httpMock.expectOne('/api/user?email=test%40test.com');
      req.flush(user);
    });

    it('should emit user$ changes', (done) => {
      const user: User = { userId: '123', userName: 'Test', userEmail: 'test@test.com' };
      let emitCount = 0;
      const expectedValues = [null, user];

      service.user$.subscribe(currentUser => {
        expect(currentUser).toEqual(expectedValues[emitCount]);
        emitCount++;
        if (emitCount === 2) {
          done();
        }
      });

      const loginPromise = service.logIn('test@test.com');
      const req = httpMock.expectOne('/api/user?email=test%40test.com');
      req.flush(user);
    });
  });
});
