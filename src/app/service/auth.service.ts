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
    this.userId = window.sessionStorage.getItem('son_userId');
  }

  public API_URL = 'http://211.20.94.210:3000/son';
  public userToken = null;
  public lang = 'zh-TW';
  public userId = null;

  public setUserToken(sonSession: string, userId: string) {
    if (sonSession == null) {
      window.sessionStorage.removeItem('son_session');
      window.sessionStorage.removeItem('son_userId');
    } else {
      window.sessionStorage.setItem('son_session', sonSession);
      sessionStorage.setItem('son_userId', userId);
    }
    this.userToken = sonSession;
    this.userId = userId;
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
        this.setUserToken(null, null);
        // this.router.navigate(['/logon']);
        location.href = '#/logon';
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

  /** show loading */
  spinnerShow() {
    document.getElementById('ngxSpinnerShow').click();
  }

  /** hide loading */
  spinnerHide() {
    document.getElementById('ngxSpinnerHide').click();
  }

  /** show loading, 有home link */
  spinnerShowAsHome() {
    document.getElementById('ngxSpinnerShowAsHome').click();
  }

  /**
   * dataURI to blob
   * @param dataURI
   */
  dataURLtoBlob(dataURI) {
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = unescape(dataURI.split(',')[1]);
    }
    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type: mimeString});
  }

  parseMaterial(val) {
    if (val === '0') {
      return '木頭';
    } else if (val === '1') {
      return '水泥';
    } else if (val === '2') {
      return '輕鋼架';
    } else if (val === '3') {
      return '玻璃';
    } else if (val === '4') {
      return '不鏽鋼/其它金屬類';
    }
  }

}
