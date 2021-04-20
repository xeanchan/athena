import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
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
import { FormService } from '../service/form.service';
import { CalculateForm } from '../form/CalculateForm';
import { ConfirmDailogComponent } from '../utility/confirm-dailog/confirm-dailog.component';
import { TranslateService } from '@ngx-translate/core';

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
    private formService: FormService,
    private pdfService: PdfService,
    private translateService: TranslateService
  ) {
    sessionStorage.removeItem('calculateForm');
    sessionStorage.removeItem('importFile');
    sessionStorage.removeItem('taskName');
  }

  taskList: any = [];
  hstList: any = [];
  timeInterval = 0;
  dialogRef;
  matDialogConfig: MatDialogConfig;
  msgDialogConfig: MatDialogConfig;
  confirmDialogConfig: MatDialogConfig;

  // round
  roundFormat = Plotly.d3.format('.1f');

  @ViewChild('pdf')
  pdf: PdfComponent;

  @ViewChild('confirmAdd')
  confirmAdd: TemplateRef<any>;

  ngOnInit(): void {
    this.matDialogConfig = new MatDialogConfig();
    this.matDialogConfig.autoFocus = false;
    this.msgDialogConfig = new MatDialogConfig();
    this.msgDialogConfig.autoFocus = false;
    this.confirmDialogConfig = new MatDialogConfig();
    this.confirmDialogConfig.autoFocus = false;

    this.getList();
    window.setTimeout(() => {
      this.startInterval();
    }, 5000);

    this.http.get(`${this.authService.API_URL}/history/${this.authService.userId}/${this.authService.userToken}`).subscribe(
      res => {
        this.hstList = res['history'];
      }, err => {
        console.log(err);
      }
    );
  }

  ngOnDestroy(): void {
    window.clearInterval(this.timeInterval);
    for (let i = 0; i < this.timeInterval; i++) {
      window.clearInterval(i);
    }
  }

  /**
   * get task list
   */
  getList() {
    if (this.authService.userToken != null) {
      this.http.get(`${this.authService.API_URL}/taskList/${this.authService.userId}/${this.authService.userToken}`).subscribe(
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
    for (let i = 0; i < this.timeInterval; i++) {
      window.clearInterval(i);
    }
    this.authService.logout();
  }

  openDialog() {
    if (window.sessionStorage.getItem('form_blank_task') != null) {
      this.matDialogConfig.data = {
        timeInterval: this.timeInterval
      };
      this.dialogRef = this.dialog.open(this.confirmAdd, this.matDialogConfig);
    } else {
      this.matDialogConfig.data = {
        timeInterval: this.timeInterval
      };
      this.dialogRef = this.dialog.open(NewPlanningComponent, this.matDialogConfig);
    }
  }

  /** 匯出歷史紀錄excel */
  exportHstExcel(taskId) {
    let url = `${this.authService.API_URL}/historyDetail/${this.authService.userId}/`;
    url += `${this.authService.userToken}/${taskId}`;
    this.http.get(url).subscribe(
      res => {
        const result = res;
        delete result['output'];
        // 回傳資料轉為CalculateForm
        const calculateForm: CalculateForm = this.formService.setHstToForm(result);
        this.excelService.export(calculateForm);
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
  async exportPDF(taskId, isHst) {
    this.pdf.export(taskId, isHst);
  }

  edit(taskId, isHst) {
    this.authService.spinnerShow();
    window.clearInterval(this.timeInterval);
    if (this.timeInterval != null) {
      for (let i = 0; i < this.timeInterval; i++) {
        window.clearInterval(i);
      }
    }
    
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
        Object.keys(sessionStorage).forEach((d) => {
          if (d.indexOf('form_') !== -1) {
            if (!d.substring(5) === taskId) {
              // 刪除其他task暫存
              sessionStorage.removeItem(d);
            }
          }
        });
        this.router.navigate(['/site/site-planning'], { queryParams: { taskId: taskId, isHst: isHst }});
        this.authService.spinnerHide();
      },
      err => {
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: '無法取得計算結果!'
        };
        this.dialog.open(MsgDialogComponent, this.msgDialogConfig);
        this.authService.spinnerHide();
      }
    );
  }

  useOld() {
    const form = sessionStorage.getItem('form_blank_task');
    sessionStorage.setItem('calculateForm', form);
    this.dialog.closeAll();
    this.router.navigate(['/site/site-planning']);
  }

  useNew() {
    this.dialog.closeAll();
    Object.keys(sessionStorage).forEach((d) => {
      if (d.indexOf('form_') !== -1) {
        // 刪除其他task暫存
        sessionStorage.removeItem(d);
      }
    });
    this.matDialogConfig.data = {
      timeInterval: this.timeInterval
    };
    this.dialogRef = this.dialog.open(NewPlanningComponent, this.matDialogConfig);
  }

  /** delete */
  delete(item, type) {
    const data = {
      infoMessage: `${this.translateService.instant('confirm.delete')}${item.taskName}?`
    };
    // confirm delete
    this.confirmDialogConfig.data = data;
    const dialogRef = this.dialog.open(ConfirmDailogComponent, this.confirmDialogConfig);
    // do delete
    dialogRef.componentInstance.onOK.subscribe(() => {
      dialogRef.close();
      const url = `${this.authService.API_URL}/deleteTask`;
      const form = {
        id: this.authService.userId,
        taskid: item.taskId,
        sessionid: this.authService.userToken
      };
      this.http.post(url, JSON.stringify(form)).subscribe(
        res => {
          if (type === 'hst') {
            this.hstList.splice(this.hstList.indexOf(item), 1);
          } else {
            this.taskList.splice(this.taskList.indexOf(item), 1);
          }
        },
        err => {
          this.msgDialogConfig.data = {
            type: 'error',
            infoMessage: this.translateService.instant('delete.fail')
          };
          this.dialog.open(MsgDialogComponent, this.msgDialogConfig);
        }
      );
    });
  }

  

}
