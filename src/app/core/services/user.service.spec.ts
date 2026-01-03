import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, User } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const USER_STORAGE_KEY = 'myrecipeconnection.com.usersLoggedInFromThisBrowser';
  const GOOGLE_AUTH_KEY = 'RecipeConnectionGoogleAuth';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should initialize with no user', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getLoggedInUser()).toBe(null);
  });

  it('should initialize with stored user', () => {
    const user: User = { userId: '123', userName: 'Test', userEmail: 'test@test.com' };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    // Create a new TestBed to get a fresh UserService instance that reads from localStorage
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    const newService = TestBed.inject(UserService);

    expect(newService.isLoggedIn()).toBe(true);
    expect(newService.getLoggedInUser()).toEqual(user);
  });

  describe('logIn', () => {
    it('should log in user and store in localStorage', (done) => {
      const user: User = { userId: '123', userName: 'Test', userEmail: 'test@test.com' };

      service.logIn('test@test.com').subscribe(() => {
        expect(service.isLoggedIn()).toBe(true);
        expect(service.getLoggedInUser()).toEqual(user);

        const stored = localStorage.getItem(USER_STORAGE_KEY);
        expect(JSON.parse(stored!)).toEqual(user);
        done();
      });

      const req = httpMock.expectOne('/api/user?email=test%40test.com');
      expect(req.request.method).toBe('GET');
      req.flush(user);
    });

    it('should return empty object on error', (done) => {
      service.logIn('test@test.com').subscribe((result) => {
        expect(result).toEqual({ data: {} });
        expect(service.isLoggedIn()).toBe(false);
        done();
      });

      const req = httpMock.expectOne('/api/user?email=test%40test.com');
      req.flush({}, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('signUp', () => {
    it('should sign up user and store in localStorage', (done) => {
      const user: User = { userId: '123', userName: 'Test', userEmail: 'test@test.com' };

      service.signUp('Test', 'test@test.com').subscribe(() => {
        expect(service.isLoggedIn()).toBe(true);
        expect(service.getLoggedInUser()).toEqual(user);

        const stored = localStorage.getItem(USER_STORAGE_KEY);
        expect(JSON.parse(stored!)).toEqual(user);
        done();
      });

      const req = httpMock.expectOne('/api/user');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ userName: 'Test', userEmail: 'test@test.com' });
      req.flush(user);
    });

    it('should return empty object on error', (done) => {
      service.signUp('Test', 'test@test.com').subscribe((result) => {
        expect(result).toEqual({ data: {} });
        expect(service.isLoggedIn()).toBe(false);
        done();
      });

      const req = httpMock.expectOne('/api/user');
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('logOut', () => {
    it('should log out and clear storage', () => {
      const user: User = { userId: '123', userName: 'Test', userEmail: 'test@test.com' };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify({ userName: 'Google', userEmail: 'google@test.com' }));

      // Manually set logged in state
      service.logIn('test@test.com').subscribe();
      const req = httpMock.expectOne('/api/user?email=test%40test.com');
      req.flush(user);

      service.logOut();

      expect(service.isLoggedIn()).toBe(false);
      expect(service.getLoggedInUser()).toBe(null);
      expect(localStorage.getItem(USER_STORAGE_KEY)).toBe(null);
      expect(localStorage.getItem(GOOGLE_AUTH_KEY)).toBe(null);
    });
  });

  describe('isExternalLoginBeingAttempted', () => {
    it('should return true if Google auth data exists in localStorage', () => {
      localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify({ userName: 'Google', userEmail: 'google@test.com' }));

      expect(service.isExternalLoginBeingAttempted()).toBe(true);
    });

    it('should return false if no Google auth data exists', () => {
      expect(service.isExternalLoginBeingAttempted()).toBe(false);
    });
  });

  describe('performExternalLogin', () => {
    it('should log in user with Google auth email', (done) => {
      const googleUser: User = { userId: '456', userName: 'Google User', userEmail: 'google@test.com' };
      localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify({ userName: 'Google User', userEmail: 'google@test.com' }));

      service.performExternalLogin().subscribe(result => {
        expect(service.isLoggedIn()).toBe(true);
        expect(service.getLoggedInUser()).toEqual(googleUser);
        done();
      });

      const req = httpMock.expectOne('/api/user?email=google%40test.com');
      expect(req.request.method).toBe('GET');
      req.flush(googleUser);
    });

    it('should sign up new user if Google auth user does not exist', (done) => {
      const newUser: User = { userId: '555', userName: 'Google User', userEmail: 'google@test.com' };
      localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify({ userName: 'Google User', userEmail: 'google@test.com' }));

      service.performExternalLogin().subscribe(result => {
        expect(service.isLoggedIn()).toBe(true);
        expect(service.getLoggedInUser()).toEqual(newUser);
        done();
      });

      const req1 = httpMock.expectOne('/api/user?email=google%40test.com');
      req1.flush({}, { status: 404, statusText: 'Not Found' });

      const req2 = httpMock.expectOne('/api/user');
      expect(req2.request.method).toBe('POST');
      expect(req2.request.body).toEqual({ userName: 'Google User', userEmail: 'google@test.com' });
      req2.flush(newUser);
    });

    it('should return empty object if no Google auth cookie exists', (done) => {
      service.performExternalLogin().subscribe(result => {
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

      service.logIn('test@test.com').subscribe();
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

      service.logIn('test@test.com').subscribe();
      const req = httpMock.expectOne('/api/user?email=test%40test.com');
      req.flush(user);
    });
  });
});
