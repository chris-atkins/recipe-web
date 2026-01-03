import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { UserHeaderInterceptor } from './user-header.interceptor';
import { UserService } from '../services/user.service';

describe('UserHeaderInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: UserHeaderInterceptor,
          multi: true
        }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    userService = TestBed.inject(UserService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add RequestingUser header when user is logged in', (done) => {
    const mockUser = { userId: '123', userName: 'Test', userEmail: 'test@test.com' };

    // First log in the user
    userService.logIn('test@test.com').subscribe(() => {
      // Now make a request and verify the header is added
      httpClient.get('/api/test').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.has('RequestingUser')).toBe(true);
      expect(req.request.headers.get('RequestingUser')).toBe('123');
      req.flush({});
    });

    const loginReq = httpMock.expectOne('/api/user?email=test%40test.com');
    loginReq.flush(mockUser);
  });

  it('should not add RequestingUser header when user is not logged in', () => {
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('RequestingUser')).toBe(false);
    req.flush({});
  });

  it('should not add header when user exists but has no userId', (done) => {
    const mockUser = { userId: '', userName: 'Test', userEmail: 'test@test.com' };

    userService.logIn('test@test.com').subscribe(() => {
      httpClient.get('/api/test').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.has('RequestingUser')).toBe(false);
      req.flush({});
    });

    const loginReq = httpMock.expectOne('/api/user?email=test%40test.com');
    loginReq.flush(mockUser);
  });
});
