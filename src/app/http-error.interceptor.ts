import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

/**
 * Http 攔截器
 */
@Injectable({
  providedIn: 'root'
})
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) { }

  /**
   * 送出request時，response 401 就導去login page
   * @param request 
   * @param next 
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        retry(0),
        catchError((err: HttpErrorResponse) => {
          if (err != null) {
            console.log(err);
            if (err.status === 401) {
              location.replace('#/logon');
              location.reload();
              // this.router.navigate(['/logon']);
            }
          }
          return throwError(err);
        })
      );
  }
 }
