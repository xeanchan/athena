import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Login Guard
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(private router: Router) { }

  /**
   * 未登入時，導去登入頁
   */
  canActivate() {
    if (window.sessionStorage.getItem('son_session') != null) {
      return true;
    }
    
    this.router.navigate(['/logon']);
    return false;
  }
}
