import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LoginForm } from '../form/LoginForm';
import { AuthService } from '../service/auth.service';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  constructor(
    public authService: AuthService,
    public router: Router) { }

  loginForm: LoginForm = new LoginForm();
  // show error message
  showMsg = false;

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    (<HTMLInputElement> document.querySelector('.input100')).focus();
  }

  logon() {
    this.authService.logon(JSON.stringify(this.loginForm)).subscribe(
      res => {
        if (typeof res['session'] !== 'undefined') {
          this.showMsg = false;
          this.authService.setUserToken(res['session']);
          this.router.navigate(['/']);
        } else {
          this.showMsg = true;
        }
      },
      err => {
        this.showMsg = true;
      }
    );
  }

  keypressHandler(event) {
    if (event.keyCode === 13) {
      this.logon();
    }
  }

}
