import { Injectable, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/**
 * 公用參數與function service
 */
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

  /** API URL */
  public API_URL = 'http://211.20.94.210:3000/son';
  /** 登入後的session_id */
  public userToken = null;
  /** 語系 */
  public lang = 'zh-TW';
  /** user id */
  public userId = null;

  /**
   * set user token
   * @param sonSession 
   * @param userId 
   */
  public setUserToken(sonSession: string, userId: string) {
    sessionStorage.setItem('son_session', sonSession);
    sessionStorage.setItem('son_userId', userId);
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
        this.router.navigate(['/logon']);
        window.setTimeout(() => {
          Object.keys(sessionStorage).forEach((d) => {
            sessionStorage.removeItem(d);
          });
        }, 0);
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

  /**
   * 切換語系
   * @param langulage 
   */
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

  /**
   * parse材質數值為文字
   * @param val 
   */
  parseMaterial(val) {
    if (val === '0' || val === 0) {
      return '木頭';
    } else if (val === '1' || val === 1) {
      return '水泥';
    } else if (val === '2' || val === 2) {
      return '輕鋼架';
    } else if (val === '3' || val === 3) {
      return '玻璃';
    } else if (val === '4' || val === 4) {
      return '不鏽鋼/其它金屬類';
    }
  }

  /**
   * check is empty
   * @param val 
   */
  isEmpty(val) {
    if (val == null || val === 'null' || val === '') {
      return true;
    } else {
      return false;
    }
  }

}
