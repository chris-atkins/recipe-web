import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable()
export class UserHeaderInterceptor implements HttpInterceptor {
  constructor(private userService: UserService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.userService.getLoggedInUser();

    if (user && user.userId) {
      const cloned = req.clone({
        headers: req.headers.set('RequestingUser', user.userId)
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}
