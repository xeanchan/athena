import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../service/auth.service';
import { NewPlanningComponent } from '../new-planning/new-planning.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

declare var Plotly: any;

@Component({
  selector: 'app-wireless-list',
  templateUrl: './wireless-list.component.html',
  styleUrls: ['./wireless-list.component.scss']
})
export class WirelessListComponent implements OnInit, OnDestroy {

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  taskList: any = [];
  timeInterval;
  dialogRef;
  matDialogConfig: MatDialogConfig;
  // round
  roundFormat = Plotly.d3.format('.1f');


  ngOnInit(): void {
    this.matDialogConfig = new MatDialogConfig();
    this.matDialogConfig.autoFocus = false;

    this.getList();
    window.setTimeout(() => {
      this.startInterval();
    }, 5000);
  }

  ngOnDestroy(): void {
    window.clearInterval(this.timeInterval);
  }

  /**
   * get task list
   */
  getList() {
    if (this.authService.userToken != null) {
      this.http.get(`${this.authService.API_URL}/taskList/sel/${this.authService.userToken}`).subscribe(
        res => {
          this.taskList = res;
        }, err => {
          console.log(err);
          this.router.navigate(['/logon']);
        }
      );
    }
  }

  /**
   * timer get list
   */
  startInterval() {
    window.clearInterval(this.timeInterval);
    this.timeInterval = window.setInterval(() => {
      this.getList();
    }, 5000);
  }

  logout() {
    window.clearInterval(this.timeInterval);
    this.authService.logout();
  }

  openDialog() {
    this.matDialogConfig.data = {
      timeInterval: this.timeInterval
    };
    this.dialogRef = this.dialog.open(NewPlanningComponent, this.matDialogConfig);
  }

  export() {
    const data = [
      ['1', 'a', 'aa'],
      ['2', 'b', 'bb'],
      ['3', 'c', 'cc']
    ];
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    console.log(wb);
    /* save to file */
    XLSX.writeFile(wb, 'SheetJS.xlsx');
  }

}
