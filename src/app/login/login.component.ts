import { Component, OnInit } from '@angular/core';
import { LoginForm } from '../form/LoginForm';
import { AuthService } from '../service/auth.service';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    public authService: AuthService,
    public router: Router,) { }

  loginForm: LoginForm = new LoginForm();

  ngOnInit() {
    // this.http.get('http://211.20.94.210:3000/son/taskList/sel/son_session_76204433-7568-440e-bfa7-dd2b310e2c4b').subscribe();
  }

  logon() {
    this.authService.logon(JSON.stringify(this.loginForm)).subscribe(
      res => {
        if (typeof res['session'] !== 'undefined') {
          this.authService.setUserToken(res['session']);
          this.router.navigate(['/']);
        }
      }
    );
  }

  keypressHandler(event) {
    if (event.keyCode === 13) {
      this.logon();
    }
  }

}
