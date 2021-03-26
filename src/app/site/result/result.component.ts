import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { CalculateForm } from '../../form/CalculateForm';
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import { PdfService } from '../../service/pdf.service';
import { PdfComponent } from '../pdf/pdf.component';
import { ProposeComponent } from '../modules/propose/propose.component';
import { SignalQualityComponent } from '../modules/signal-quality/signal-quality.component';
import { SignalCoverComponent } from '../modules/signal-cover/signal-cover.component';
import { SignalStrengthComponent } from '../modules/signal-strength/signal-strength.component';
import { PerformanceComponent } from '../modules/performance/performance.component';
import { StatisticsComponent } from '../modules/statistics/statistics.component';
import { SiteInfoComponent } from '../modules/site-info/site-info.component';
import { MsgDialogComponent } from '../../utility/msg-dialog/msg-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { View3dComponent } from '../view3d/view3d.component';
import { FormService } from '../../service/form.service';

declare var Plotly: any;

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private matDialog: MatDialog,
    public spinner: NgxSpinnerService,
    private pdfService: PdfService,
    private translateService: TranslateService,
    private formService: FormService,
    private http: HttpClient) { }

  taskId;
  // taskId = 'task_sel_26cc4b6e-7096-4202-aa39-500a1214df85_0';
  result = {};
  calculateForm: CalculateForm = new CalculateForm();
  plotLayout;
  showQuality = true;
  showCover = false;
  showStrength = false;
  zValues = [];
  zValue;
  chartType = 'SINR';
  msgDialogConfig: MatDialogConfig = new MatDialogConfig();
  view3dDialogConfig: MatDialogConfig = new MatDialogConfig();

  defaultBSList = [];
  candidateList = [];
  obstacleList = [];
  ueList = [];
  dragObject = {};
  /** 歷史紀錄 */
  isHst = false;
  showUE = true;
  hstOutput = {};
  // 有UE
  showUEArea = false;
  // 有障礙物
  showObstacleArea = false;
  // 有AP
  showCandidateArea = false;
  // 障礙物顯示
  showObstacle = true;
  // AP顯示
  showCandidate = true;

  @ViewChild('pdf') pdf: PdfComponent;

  @ViewChild('propose') propose: ProposeComponent;
  @ViewChild('quality') quality: SignalQualityComponent;
  @ViewChild('cover') cover: SignalCoverComponent;
  @ViewChild('strength') strength: SignalStrengthComponent;
  @ViewChild('performance') performance: PerformanceComponent;
  @ViewChild('statistics') statistics: StatisticsComponent;
  @ViewChild('siteInfo') siteInfo: SiteInfoComponent;

  ngOnInit() {
    this.view3dDialogConfig.autoFocus = false;
    this.view3dDialogConfig.width = '80%';
    this.view3dDialogConfig.hasBackdrop = false;
    this.msgDialogConfig.autoFocus = false;
    this.route.queryParams.subscribe(params => {
      this.taskId = params['taskId'];
      if (params['isHst'] === 'true') {
        this.isHst = true;
      }
      this.getResult();
    });
    // this.getResult();

  }

  getResult() {
    let url;
    if (this.isHst) {
      // 歷史紀錄
      url = `${this.authService.API_URL}/historyDetail/${this.authService.userId}/`;
      url += `${this.authService.userToken}/${this.taskId}`;
    } else {
      url = `${this.authService.API_URL}/completeCalcResult/${this.taskId}/${this.authService.userToken}`;
    }
    this.http.get(url).subscribe(
      res => {
        // console.log(res);
        if (this.isHst) {
          // 大小寫不同，各自塞回form
          this.result = this.formService.setHstOutputToResultOutput(res['output']);
          this.calculateForm = this.formService.setHstToForm(res);
        } else {
          this.calculateForm = res['input'];
          this.result = res['output'];
        }
        console.log(this.result);

        if (this.calculateForm.defaultBs !== '') {
          const defaultBs = this.calculateForm.defaultBs.split('|');
          for (const item of defaultBs) {
            const obj = JSON.parse(item);
            this.defaultBSList.push({
              x: obj[0],
              y: obj[1],
              z: obj[2]
            });
          }
        }

        let candidateBs = [];
        if (this.calculateForm.candidateBs !== '') {
          this.showCandidateArea = true;
          candidateBs = this.calculateForm.candidateBs.split('|');
          for (const item of candidateBs) {
            const obj = JSON.parse(item);
            this.candidateList.push({
              x: obj[0],
              y: obj[1],
              z: obj[2]
            });
          }
        }

        if (this.calculateForm.obstacleInfo !== '') {
          this.showObstacleArea = true;
          const obstacleInfo = this.calculateForm.obstacleInfo.split('|');
          for (const item of obstacleInfo) {
            const obj = JSON.parse(item);
            this.obstacleList.push({
              x: obj[0],
              y: obj[1],
              width: obj[2],
              height: obj[3],
              altitude: obj[4]
            });
          }
        }

        if (this.calculateForm.ueCoordinate !== '') {
          this.showUEArea = true;
          const ueCoordinate = this.calculateForm.ueCoordinate.split('|');
          for (const item of ueCoordinate) {
            const obj = JSON.parse(item);
            this.ueList.push({
              x: obj[0],
              y: obj[1],
              z: obj[2]
            });
          }
        }

        // 建議方案
        this.propose.calculateForm = this.calculateForm;
        this.propose.result = this.result;
        this.propose.drawLayout(false);
        // 訊號品質圖
        this.zValues = JSON.parse(this.calculateForm.zValue);
        this.zValue = this.zValues[0];
        this.drawQuality();
        // 預估效能
        this.performance.calculateForm = this.calculateForm;
        this.performance.result = this.result;
        this.performance.setData();
        // 統計資訊
        this.statistics.calculateForm = this.calculateForm;
        this.statistics.result = this.result;
        this.statistics.drawChart(false);

        this.siteInfo.calculateForm = this.calculateForm;
        this.siteInfo.result = this.result;
        window.setTimeout(() => {
          this.siteInfo.inputBsListCount = candidateBs.length;
          this.siteInfo.defaultBsCount = this.result['defaultBs'].length;
        }, 0);

        this.hstOutput['gaResult'] = {};
        this.hstOutput['gaResult']['chosenCandidate'] = this.result['chosenCandidate'];
        this.hstOutput['gaResult']['sinrMap'] = this.result['sinrMap'];
        this.hstOutput['gaResult']['connectionMapAll'] = this.result['connectionMapAll'];
        this.hstOutput['gaResult']['rsrpMap'] = this.result['rsrpMap'];

        const sinrAry = [];
        this.result['sinrMap'].map(v => {
          v.map(m => {
            m.map(d => {
              sinrAry.push(d);
            });
          });
        });

        const rsrpAry = [];
        this.result['rsrpMap'].map(v => {
          v.map(m => {
            m.map(d => {
              rsrpAry.push(d);
            });
          });
        });

        this.hstOutput['sinrMax'] = Plotly.d3.max(sinrAry);
        this.hstOutput['sinrMin'] = Plotly.d3.min(sinrAry);
        this.hstOutput['rsrpMax'] = Plotly.d3.max(rsrpAry);
        this.hstOutput['rsrpMin'] = Plotly.d3.min(rsrpAry);
      }
    );
  }

  /** export PDF */
  async exportPDF() {
    this.pdf.export(this.taskId, this.isHst);
  }

  /** 訊號品質圖 */
  drawQuality() {
    this.showQuality = true;
    this.showCover = false;
    this.showStrength = false;
    window.setTimeout(() => {
      this.quality.showUE = this.showUE;
      this.quality.calculateForm = this.calculateForm;
      this.quality.result = this.result;
      this.quality.showObstacle = this.showObstacle ? 'visible' : 'hidden';
      this.quality.showCandidate = this.showCandidate ? 'visible' : 'hidden';
      this.quality.draw(false, this.zValue);
    }, 0);
  }

  /** 訊號覆蓋圖 */
  drawCover() {
    this.showQuality = false;
    this.showCover = true;
    this.showStrength = false;
    window.setTimeout(() => {
      this.cover.showUE = this.showUE;
      this.cover.calculateForm = this.calculateForm;
      this.cover.result = this.result;
      this.cover.showObstacle = this.showObstacle ? 'visible' : 'hidden';
      this.cover.showCandidate = this.showCandidate ? 'visible' : 'hidden';
      this.cover.draw(false, this.zValue);
    }, 0);
  }

  /** 訊號強度圖 */
  drawStrength() {
    this.showQuality = false;
    this.showCover = false;
    this.showStrength = true;
    window.setTimeout(() => {
      this.strength.showUE = this.showUE;
      this.strength.calculateForm = this.calculateForm;
      this.strength.result = this.result;
      this.strength.showObstacle = this.showObstacle ? 'visible' : 'hidden';
      this.strength.showCandidate = this.showCandidate ? 'visible' : 'hidden';
      this.strength.draw(false, this.zValue);
    }, 0);
  }

  /** change 高度 */
  changeZvalue() {
    if (this.chartType === 'SINR') {
      this.drawQuality();
    } else if (this.chartType === 'PCI') {
      this.drawCover();
    } else if (this.chartType === 'RSRP') {
      this.drawStrength();
    }
  }

  /** 回上頁 */
  back() {
    this.save(true);
  }

  /** 儲存 */
  save(isBack) {
    const form = {
      id: this.authService.userId,
      taskid: this.taskId,
      sessionid: this.authService.userToken
    };
    const url = `${this.authService.API_URL}/storeResult`;
    this.http.post(url, JSON.stringify(form)).subscribe(
      res => {
        if (isBack) {
          // 回上一頁
          this.router.navigate(['/site/site-planning'], { queryParams: { taskId: this.taskId, isHst: true }});
        } else {
          this.msgDialogConfig.data = {
            type: 'success',
            infoMessage: this.translateService.instant('save.success')
          };
          this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        }
      },
      err => {
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: this.translateService.instant('save.failed')
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      }
    );
  }

  view3D() {
    this.view3dDialogConfig.data = {
      calculateForm: this.calculateForm,
      obstacleList: this.obstacleList,
      defaultBSList: this.defaultBSList,
      candidateList: this.candidateList,
      ueList: this.ueList,
      zValue: this.zValues,
      result: this.hstOutput
    };
    this.matDialog.open(View3dComponent, this.view3dDialogConfig);
  }

  /** ON/OFF 顯示UE */
  switchShowUE() {
    if (this.chartType === 'SINR') {
      this.quality.switchUE(this.showUE);
    } else if (this.chartType === 'PCI') {
      this.cover.switchUE(this.showUE);
    } else if (this.chartType === 'RSRP') {
      this.strength.switchUE(this.showUE);
    }
  }

  /** ON/OFF 顯示障礙物 */
  switchShowObstacle() {
    const visible = this.showObstacle ? 'visible' : 'hidden';
    if (this.chartType === 'SINR') {
      this.quality.switchShowObstacle(visible);
    } else if (this.chartType === 'PCI') {
      this.cover.switchShowObstacle(visible);
    } else if (this.chartType === 'RSRP') {
      this.strength.switchShowObstacle(visible);
    }
  }

  /** ON/OFF 顯示AP */
  switchShowCandidate() {
    const visible = this.showCandidate ? 'visible' : 'hidden';
    if (this.chartType === 'SINR') {
      this.quality.switchShowCandidate(visible);
    } else if (this.chartType === 'PCI') {
      this.cover.switchShowCandidate(visible);
    } else if (this.chartType === 'RSRP') {
      this.strength.switchShowCandidate(visible);
    }
  }

}
