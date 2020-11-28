import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, public router: Router) {
    this.userToken = window.sessionStorage.getItem('son_session');
  }

  public API_URL = 'http://211.20.94.210:3000/son';
  public userToken = null;

  public setUserToken(son_session: string) {
    if (son_session == null) {
      window.sessionStorage.removeItem('son_session');
    } else {
      window.sessionStorage.setItem('son_session', son_session);
    }
    this.userToken = son_session;
  }

  /**
   * logout
   */
  public logout() {
    const form = {
      session: this.userToken
    };
    this.http.post(`${this.API_URL}/logout`, JSON.stringify(form)).subscribe(
      res => {
        this.setUserToken(null);
        this.router.navigate(['/logon']);
      }
    );
  }

  /**
   * get token from server and save TokenResponse to localstorage
   * @param treq TokenRequest
   */
  public logon(loginForm): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, loginForm);
  }
}
