import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { MatDialog } from '@angular/material/dialog';
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

  @ViewChild('pdf') pdf: PdfComponent;

  @ViewChild('propose') propose: ProposeComponent;
  @ViewChild('quality') quality: SignalQualityComponent;
  @ViewChild('cover') cover: SignalCoverComponent;
  @ViewChild('strength') strength: SignalStrengthComponent;
  @ViewChild('performance') performance: PerformanceComponent;
  @ViewChild('statistics') statistics: StatisticsComponent;
  @ViewChild('siteInfo') siteInfo: SiteInfoComponent;


  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.taskId = params['taskId'];
      this.getResult();
    });
    // this.getResult();

  }

  getResult() {
    const url = `${this.authService.API_URL}/completeCalcResult/${this.taskId}/${this.authService.userToken}`;
    this.http.get(url).subscribe(
      res => {
        // console.log(res)
        this.calculateForm = res['input'];
        this.result = res['output'];
        this.propose.calculateForm = this.calculateForm;
        this.propose.result = this.result;
        this.propose.drawLayout(false);
        // 訊號品質圖
        this.zValues = this.calculateForm.zValue.replace('[', '').replace(']', '') .split(',');
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
          this.siteInfo.inputBsListCount = this.result['inputBsList'].length;
          this.siteInfo.defaultBsCount = this.result['defaultBs'].length;
        }, 0);

        console.log(this.result);
      }
    );
  }

  /** export PDF */
  async exportPDF() {
    this.pdf.export(this.taskId);
    // document.getElementById('pdf_area').style.display = 'block';
    // await this.pdfService.export(this.calculateForm.taskName);
    // document.getElementById('pdf_area').style.display = 'none';
  }

  drawQuality() {
    this.showQuality = true;
    this.showCover = false;
    this.showStrength = false;
    window.setTimeout(() => {
      this.quality.calculateForm = this.calculateForm;
      this.quality.result = this.result;
      this.quality.draw(false, this.zValue);
    }, 0);
  }

  drawCover() {
    this.showQuality = false;
    this.showCover = true;
    this.showStrength = false;
    window.setTimeout(() => {
      this.cover.calculateForm = this.calculateForm;
      this.cover.result = this.result;
      this.cover.draw(false, this.zValue);
    }, 0);
  }

  drawStrength() {
    this.showQuality = false;
    this.showCover = false;
    this.showStrength = true;
    window.setTimeout(() => {
      this.strength.calculateForm = this.calculateForm;
      this.strength.result = this.result;
      this.strength.draw(false, this.zValue);
    }, 0);
  }

  changeZvalue() {
    this.drawQuality();
  }

}
