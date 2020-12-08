import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../service/auth.service';
import { NewPlanningComponent } from '../new-planning/new-planning.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-wireless-list',
  templateUrl: './wireless-list.component.html',
  styleUrls: ['./wireless-list.component.scss']
})
export class WirelessListComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private dialog: MatDialog
  ) { }

  taskList;
  timeInterval;
  dialogRef;
  matDialogConfig: MatDialogConfig;


  ngOnInit(): void {
    this.matDialogConfig = new MatDialogConfig();
    this.matDialogConfig.autoFocus = false;

    this.getList();
    window.setTimeout(() => {
      this.startInterval();
    }, 5000);
  }

  /**
   * get task list
   */
  getList() {
    if (this.authService.userToken != null) {
      this.http.get(`${this.authService.API_URL}/taskList/sel/${this.authService.userToken}`).subscribe(
        res => {
          this.taskList = res;
        }
      );
    }
  }

  /**
   * timer get list
   */
  startInterval() {
    window.clearInterval(this.timeInterval);
    window.setInterval(() => {
      this.getList();
    }, 5000);
  }

  logout() {
    window.clearInterval(this.timeInterval);
    this.authService.logout();
  }

  openDialog() {
    this.dialogRef = this.dialog.open(NewPlanningComponent, this.matDialogConfig);
  }

}
