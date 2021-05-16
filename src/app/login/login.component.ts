import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LoginForm } from '../form/LoginForm';
import { AuthService } from '../service/auth.service';
import {  Router } from '@angular/router';

/**
 * Login page
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  constructor(
    public authService: AuthService,
    public router: Router) { }

  /** login form */
  loginForm: LoginForm = new LoginForm();
  /** show error message */
  showMsg = false;

  ngOnInit() {
  }

  /** 頁面載入後auto focus帳號field */
  ngAfterViewInit(): void {
    (<HTMLInputElement> document.querySelector('.input100')).focus();
  }

  /** 登入 */
  logon() {
    this.authService.spinnerShow();
    this.authService.logon(JSON.stringify(this.loginForm)).subscribe(
      res => {
        if (typeof res['session'] !== 'undefined') {
          this.showMsg = false;
          this.authService.setUserToken(res['session'], this.loginForm.id);
          // 進入列表頁
          this.router.navigate(['/']);
        } else {
          // login fail
          this.showMsg = true;
        }
        this.authService.spinnerHide();
      },
      err => {
        this.authService.spinnerHide();
        this.showMsg = true;
      }
    );
  }

  /**
   * 按enter login
   * @param event keyboard event
   */
  keypressHandler(event) {
    if (event.keyCode === 13) {
      this.logon();
    }
  }

}
