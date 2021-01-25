import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../service/auth.service';
import { NewPlanningComponent } from '../new-planning/new-planning.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { PdfService } from '../service/pdf.service';
import { PdfComponent } from '../site/pdf/pdf.component';
import { ExcelService } from '../service/excel.service';
import { MsgDialogComponent } from '../utility/msg-dialog/msg-dialog.component';

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
    private excelService: ExcelService,
    private pdfService: PdfService
  ) {
    sessionStorage.removeItem('calculateForm');
    sessionStorage.removeItem('importFile');
    sessionStorage.removeItem('taskName');
  }

  taskList: any = [];
  hstList: any = [];
  timeInterval;
  dialogRef;
  matDialogConfig: MatDialogConfig;
  msgDialogConfig: MatDialogConfig;
  // round
  roundFormat = Plotly.d3.format('.1f');

  @ViewChild('pdf')
  pdf: PdfComponent;

  ngOnInit(): void {
    this.matDialogConfig = new MatDialogConfig();
    this.matDialogConfig.autoFocus = false;
    this.msgDialogConfig = new MatDialogConfig();
    this.msgDialogConfig.autoFocus = false;

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

      this.http.get(`${this.authService.API_URL}/history/sel/${this.authService.userToken}`).subscribe(
        res => {
          this.hstList = res['history'];
        }, err => {
          console.log(err);
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

  exportHstExcel(taskId) {
    const url = `${this.authService.API_URL}/historyDetail/${taskId}/${this.authService.userToken}`;
    this.http.get(url).subscribe(
      res => {
        this.excelService.export(res['input']);
      }, err => {
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: '無法取得計算結果!'
        };
        this.dialog.open(MsgDialogComponent, this.msgDialogConfig);
      }
    );
  }

  /** export excel */
  exportExcel(taskId) {
    const url = `${this.authService.API_URL}/completeCalcResult/${taskId}/${this.authService.userToken}`;
    this.http.get(url).subscribe(
      res => {
        this.excelService.export(res['input']);
      },
      err => {
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: '無法取得計算結果!'
        };
        this.dialog.open(MsgDialogComponent, this.msgDialogConfig);
      }
    );
  }

  /** export PDF */
  async exportPDF(taskId) {
    this.pdf.export(taskId);
  }

  edit(taskId, isHst) {
    window.clearInterval(this.timeInterval);
    // this.router.navigate(['/site/site-planning'], { queryParams: { taskId: taskId }});
    let url;
    if (isHst) {
      // 歷史紀錄
      url = `${this.authService.API_URL}/historyDetail/${this.authService.userId}/`;
      url += `${this.authService.userToken}/${taskId}`;
    } else {
      url = `${this.authService.API_URL}/completeCalcResult/${taskId}/${this.authService.userToken}`;
    }
    this.http.get(url).subscribe(
      res => {
        this.router.navigate(['/site/site-planning'], { queryParams: { taskId: taskId, isHst: isHst }});
      },
      err => {
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: '無法取得計算結果!'
        };
        this.dialog.open(MsgDialogComponent, this.msgDialogConfig);
      }
    );
  }

}
