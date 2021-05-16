import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

/**
 * 共用Layout Component
 */
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  /**
   * 回首頁
   */
  home() {
    window.setTimeout(() => {
      try {
        this.router.navigate(['/']);  
      } catch (error) {
        this.router.navigate(['/']);
      }
    }, 0);
    
    
  }

  /**
   * 登出
   */
  logout() {
    this.authService.logout();
  }

}
