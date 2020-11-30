import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  logout() {
    // window.clearInterval(this.timeInterval);
    this.authService.logout();
  }

}
