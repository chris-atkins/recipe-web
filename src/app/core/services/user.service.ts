import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface User {
  userId: string;
  userName: string;
  userEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USER_STORAGE_KEY = 'myrecipeconnection.com.usersLoggedInFromThisBrowser';
  private readonly GOOGLE_AUTH_KEY = 'RecipeConnectionGoogleAuth';

  private loggedInSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<User | null>(null);

  public loggedIn$ = this.loggedInSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeUser();
  }

  private initializeUser(): void {
    const userJson = localStorage.getItem(this.USER_STORAGE_KEY);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.userSubject.next(user);
        this.loggedInSubject.next(true);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem(this.USER_STORAGE_KEY);
      }
    }
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }

  getLoggedInUser(): User | null {
    return this.userSubject.value;
  }

  logIn(email: string): Observable<any> {
    return this.http.get<User>(`/api/user?email=${encodeURIComponent(email)}`)
      .pipe(
        tap(user => this.handleLogin(user)),
        catchError(() => {
          // Return empty object on error (matching AngularJS behavior)
          return of({ data: {} });
        })
      );
  }

  signUp(name: string, email: string): Observable<any> {
    const userToSave = { userName: name, userEmail: email };
    return this.http.post<User>('/api/user', userToSave)
      .pipe(
        tap(user => this.handleLogin(user)),
        catchError(() => {
          // Return empty object on error (matching AngularJS behavior)
          return of({ data: {} });
        })
      );
  }

  logOut(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    localStorage.removeItem(this.GOOGLE_AUTH_KEY);
    this.userSubject.next(null);
    this.loggedInSubject.next(false);
  }

  private handleLogin(user: User): void {
    this.userSubject.next(user);
    this.loggedInSubject.next(true);
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
  }

  isExternalLoginBeingAttempted(): boolean {
    const googleAuthJson = localStorage.getItem(this.GOOGLE_AUTH_KEY);
    return googleAuthJson !== null && googleAuthJson !== undefined;
  }

  performExternalLogin(): Observable<any> {
    const googleAuthJson = localStorage.getItem(this.GOOGLE_AUTH_KEY);
    if (!googleAuthJson) {
      return of({});
    }

    try {
      const googleAuthUser = JSON.parse(googleAuthJson);
      return this.googleLogIn(googleAuthUser.userName, googleAuthUser.userEmail);
    } catch (e) {
      console.error('Failed to parse Google auth data', e);
      return of({});
    }
  }

  private googleLogIn(name: string, email: string): Observable<any> {
    return this.http.get<User>(`/api/user?email=${encodeURIComponent(email)}`)
      .pipe(
        tap(user => this.handleLogin(user)),
        catchError(() => {
          // User doesn't exist, sign up
          return this.signUp(name, email);
        })
      );
  }
}
