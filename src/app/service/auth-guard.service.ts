import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(private router: Router) { }

  canActivate() {
    if (window.sessionStorage.getItem('son_session') != null) {
      return true;
    }
    
    this.router.navigate(['/logon']);
    return false;
  }
}
