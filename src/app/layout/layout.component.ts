import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  constructor(
    public authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  home() {
    // location.href = '';
    window.setTimeout(() => {
      try {
        this.router.navigate(['/']);  
      } catch (error) {
        this.router.navigate(['/']);
      }
    }, 0);
    
    
  }

  logout() {
    // window.clearInterval(this.timeInterval);
    this.authService.logout();
  }

}
