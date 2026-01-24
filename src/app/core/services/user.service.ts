import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  userId: string;
  userName: string;
  userEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USER_COOKIE_KEY = 'myrecipeconnection.com.usersLoggedInFromThisBrowser';
  private readonly GOOGLE_AUTH_KEY = 'RecipeConnectionGoogleAuth';

  private loggedInSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<User | null>(null);

  public loggedIn$ = this.loggedInSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeUser();
  }

  // Cookie utility methods (matching AngularJS $cookies behavior)
  private getCookie(name: string): string | null {
    const nameEq = name + '=';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEq) === 0) {
        return decodeURIComponent(cookie.substring(nameEq.length));
      }
    }
    return null;
  }

  private getCookieObject<T>(name: string): T | null {
    const value = this.getCookie(name);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  private setCookieObject(name: string, value: any, expiresDate?: Date): void {
    const jsonValue = JSON.stringify(value);
    let cookieString = `${name}=${encodeURIComponent(jsonValue)}; path=/`;
    if (expiresDate) {
      cookieString += `; expires=${expiresDate.toUTCString()}`;
    }
    document.cookie = cookieString;
  }

  private removeCookie(name: string): void {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  private initializeUser(): void {
    this.refreshUserFromCookie();
  }

  // Re-check cookie each time in case login happened through AngularJS
  private refreshUserFromCookie(): void {
    const user = this.getCookieObject<User>(this.USER_COOKIE_KEY);
    if (user) {
      this.userSubject.next(user);
      this.loggedInSubject.next(true);
    } else {
      this.userSubject.next(null);
      this.loggedInSubject.next(false);
    }
  }

  isLoggedIn(): boolean {
    // Re-check cookie each time in case login happened through AngularJS
    this.refreshUserFromCookie();
    return this.loggedInSubject.value;
  }

  getLoggedInUser(): User | null {
    // Re-check cookie each time in case login happened through AngularJS
    this.refreshUserFromCookie();
    return this.userSubject.value;
  }

  getUserById(userId: string): Promise<User> {
    return firstValueFrom(this.http.get<User>(`/api/user/${userId}`));
  }

  logIn(email: string): Promise<any> {
    return firstValueFrom(
      this.http.get<User>(`/api/user?email=${encodeURIComponent(email)}`)
        .pipe(tap(user => this.handleLogin(user)))
    ).catch(() => {
      // Return empty object on error (matching AngularJS behavior)
      return { data: {} };
    });
  }

  signUp(name: string, email: string): Promise<any> {
    const userToSave = { userName: name, userEmail: email };
    return firstValueFrom(
      this.http.post<User>('/api/user', userToSave)
        .pipe(tap(user => this.handleLogin(user)))
    ).catch(() => {
      // Return empty object on error (matching AngularJS behavior)
      return { data: {} };
    });
  }

  logOut(): void {
    this.removeCookie(this.USER_COOKIE_KEY);
    this.removeCookie(this.GOOGLE_AUTH_KEY);
    this.userSubject.next(null);
    this.loggedInSubject.next(false);
  }

  private handleLogin(user: User): void {
    this.userSubject.next(user);
    this.loggedInSubject.next(true);
    // Set cookie to expire in 100 years (matching AngularJS behavior)
    const now = new Date();
    const expiresDate = new Date(now.getFullYear() + 100, now.getMonth(), now.getDate());
    this.setCookieObject(this.USER_COOKIE_KEY, user, expiresDate);
  }

  isExternalLoginBeingAttempted(): boolean {
    const googleAuthUser = this.getCookieObject(this.GOOGLE_AUTH_KEY);
    return googleAuthUser !== null;
  }

  performExternalLogin(): Promise<any> {
    const googleAuthUser = this.getCookieObject<{userName: string, userEmail: string}>(this.GOOGLE_AUTH_KEY);
    if (!googleAuthUser) {
      return Promise.resolve({});
    }

    return this.googleLogIn(googleAuthUser.userName, googleAuthUser.userEmail);
  }

  private googleLogIn(name: string, email: string): Promise<any> {
    return firstValueFrom(
      this.http.get<User>(`/api/user?email=${encodeURIComponent(email)}`)
        .pipe(tap(user => this.handleLogin(user)))
    ).catch(() => {
      // User doesn't exist, sign up
      return this.signUp(name, email);
    });
  }
}
