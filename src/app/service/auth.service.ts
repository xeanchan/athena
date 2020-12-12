import { Injectable, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    public router: Router,
    private translateService: TranslateService
  ) {
    this.userToken = window.sessionStorage.getItem('son_session');
  }

  public API_URL = 'http://211.20.94.210:3000/son';
  public userToken = null;
  public lang = 'zh-TW';

  public setUserToken(sonSession: string) {
    if (sonSession == null) {
      window.sessionStorage.removeItem('son_session');
    } else {
      window.sessionStorage.setItem('son_session', sonSession);
    }
    this.userToken = sonSession;
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

  public changeLanguage(langulage) {
    this.translateService.use(langulage);
  }
}
