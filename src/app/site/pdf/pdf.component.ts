import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { HttpClient } from '@angular/common/http';
import { CalculateForm } from '../../form/CalculateForm';
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import { ProposeComponent } from '../modules/propose/propose.component';
import { SignalQualityComponent } from '../modules/signal-quality/signal-quality.component';
import { SignalCoverComponent } from '../modules/signal-cover/signal-cover.component';
import { SignalStrengthComponent } from '../modules/signal-strength/signal-strength.component';
import { PerformanceComponent } from '../modules/performance/performance.component';
import { StatisticsComponent } from '../modules/statistics/statistics.component';
import { SiteInfoComponent } from '../modules/site-info/site-info.component';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss']
})
export class PdfComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private http: HttpClient) { }

  taskId = 'task_sel_d2f81cef-01c8-4444-9352-f4a1ffb5ccca_1';
  result = {};
  calculateForm: CalculateForm = new CalculateForm();
  zValues = [];
  defaultBs = [];
  inputBsList = [];
  obstacleList = [];
  ueList = [];

  @ViewChild('propose') propose: ProposeComponent;
  @ViewChildren('quality') quality: QueryList<SignalQualityComponent>;
  @ViewChildren('cover') cover: QueryList<SignalCoverComponent>;
  @ViewChildren('strength') strength: QueryList<SignalStrengthComponent>;
  @ViewChild('performance') performance: PerformanceComponent;
  @ViewChild('statistics') statistics: StatisticsComponent;
  @ViewChild('siteInfo') siteInfo: SiteInfoComponent;

  ngOnInit() {
    // this.route.queryParams.subscribe(params => {
    //   this.taskId = params['taskId'];
    //   this.getResult();
    // });
    this.export(this.taskId);

    // this.calculateForm = JSON.parse(sessionStorage.getItem('calculateForm'));
  }

  async export(taskId) {
    this.taskId = taskId;
    //this.authService.spinnerShow();
    if (typeof this.taskId !== 'undefined') {
      const url = `${this.authService.API_URL}/completeCalcResult/${this.taskId}/${this.authService.userToken}`;
      this.http.get(url).subscribe(
        res => {
          if (document.getElementById('pdf_area') != null) {
            document.getElementById('pdf_area').style.display = 'block';
          }

          // console.log(res)
          this.calculateForm = res['input'];
          this.result = res['output'];
          this.defaultBs = this.result['defaultBs'];
          this.inputBsList = this.result['inputBsList'];
          // 障礙物資訊
          const obstacle = this.calculateForm.obstacleInfo
          .replace(new RegExp('\\[', 'gi'), '').replace(new RegExp('\\]', 'gi'), '').split('|');
          for (const item of obstacle) {
            this.obstacleList.push(item.split(','));
          }
          // 行動終端分佈
          const ueCoordinate = this.calculateForm.ueCoordinate
          .replace(new RegExp('\\[', 'gi'), '').replace(new RegExp('\\]', 'gi'), '').split('|');
          for (const item of ueCoordinate) {
            this.ueList.push(item.split(','));
          }

          this.zValues = this.calculateForm.zValue.replace('[', '').replace(']', '') .split(',');
          window.setTimeout(() => {
            this.propose.calculateForm = this.calculateForm;
            this.propose.result = this.result;
            this.propose.drawLayout(true);
            // 訊號品質圖
            let index = 0;
            this.quality.forEach(element => {
              element.calculateForm = this.calculateForm;
              element.result = this.result;
              element.draw(true, this.zValues[index]);
              index++;
            });

            // 訊號覆蓋圖
            index = 0;
            this.cover.forEach(element => {
              element.calculateForm = this.calculateForm;
              element.result = this.result;
              element.draw(true, this.zValues[index]);
              index++;
            });

            // 訊號強度圖
            index = 0;
            this.strength.forEach(element => {
              element.calculateForm = this.calculateForm;
              element.result = this.result;
              element.draw(true, this.zValues[index]);
              index++;
            });

            // 統計資訊
            this.performance.calculateForm = this.calculateForm;
            this.performance.result = this.result;
            this.performance.setData();
            this.statistics.calculateForm = this.calculateForm;
            this.statistics.result = this.result;
            this.statistics.drawChart(true);

            this.siteInfo.calculateForm = this.calculateForm;
            this.siteInfo.result = this.result;
            window.setTimeout(() => {
              this.siteInfo.inputBsListCount = this.result['inputBsList'].length;
              this.siteInfo.defaultBsCount = this.result['defaultBs'].length;
            }, 0);
            console.log(this.result);
            window.setTimeout(() => {
              //this.genericPDF(this.calculateForm.taskName);
            }, 500);
          }, 0);
        }
      );
    }
  }

  /** export PDF */
  async genericPDF(taskName) {
    // this.authService.spinnerShow();
    const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
    const area = document.querySelector('#pdf_area');
    const list = ['site_info', 'defaultBs_list', 'inputBs_list', 'obstacle_list', 'ue_list', 'propose'];
    for (let k = 0; k < this.zValues.length; k++) {
      list.push(`signal_${k}`);
    }
    list.push('performace');
    list.push('statistics');
    let i = 0;
    for (const id of list) {
      const data = <HTMLDivElement> area.querySelector(`#${id}`);
      await html2canvas(data).then(canvas => {
        // Few necessary setting options
        const imgWidth = 208;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const contentDataURL = canvas.toDataURL('image/png');
        const position = 0;
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      });

      i++;
    }
    document.getElementById('pdf_area').style.display = 'none';
    this.authService.spinnerHide();
    pdf.save(`${taskName}_report.pdf`); // Generated PDF
  }

}
