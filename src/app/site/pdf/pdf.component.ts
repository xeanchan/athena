import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { HttpClient } from '@angular/common/http';
import { CalculateForm } from '../../form/CalculateForm';
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ProposeComponent } from '../modules/propose/propose.component';
import { SignalQualityComponent } from '../modules/signal-quality/signal-quality.component';
import { SignalCoverComponent } from '../modules/signal-cover/signal-cover.component';
import { SignalStrengthComponent } from '../modules/signal-strength/signal-strength.component';
import { PerformanceComponent } from '../modules/performance/performance.component';
import { StatisticsComponent } from '../modules/statistics/statistics.component';
import { SiteInfoComponent } from '../modules/site-info/site-info.component';
import { JsPDFFontService } from '../../service/js-pdffont.service';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss']
})
export class PdfComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private jsPDFFontService: JsPDFFontService,
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
    // this.export(this.taskId);

    // this.calculateForm = JSON.parse(sessionStorage.getItem('calculateForm'));
  }

  async export(taskId) {
    this.taskId = taskId;
    this.authService.spinnerShow();
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
          const defaultBsAry = this.calculateForm.defaultBs
          .replace(new RegExp('\\[', 'gi'), '').replace(new RegExp('\\]', 'gi'), '').split('|');
          for (const item of defaultBsAry) {
            this.defaultBs.push(item.split(','));
          }
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
              this.genericPDF(this.calculateForm.taskName);
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
    // 設定字型
    this.jsPDFFontService.AddFontArimo(pdf);

    const area = document.querySelector('#pdf_area');
    const list = ['propose'];
    for (let k = 0; k < this.zValues.length; k++) {
      list.push(`signal_${k}`);
    }
    list.push('performace');
    list.push('statistics');

    const options = {
      pagesplit: true,
      background: '#ffffff'
    };
    const siteData = <HTMLDivElement> area.querySelector(`#site_info`);
    await html2canvas(siteData).then(canvas => {
      // Few necessary setting options
      const imgWidth = 208;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const contentDataURL = canvas.toDataURL('image/png');
      const position = 0;
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
    });
    pdf.addPage();
    // 現有基站
    const defaultBsTitle = ['編號', 'X座標', 'Y座標', 'Z座標'];
    const defaultBsHeader = (data) => {
      pdf.setFontSize(12);
      // pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      pdf.setFillColor(140, 205, 232);
      pdf.rect(14, 7, 182, 7, 'F');
      pdf.text('現有基站', 100, 12);
    };
    const defaultBsData = [];
    for (let k = 0; k < this.defaultBs.length; k++) {
      if (this.defaultBs[k][0] === '') {
        defaultBsData.push(['未設置現有基站資訊']);
        continue;
      }
      defaultBsData.push([
        (k + 1), this.defaultBs[k][0], this.defaultBs[k][1], this.defaultBs[k][2]
      ]);
    }
    pdf.autoTable(defaultBsTitle, defaultBsData, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: defaultBsHeader,
      // startY: 40,
    });
    // 新增基站
    pdf.addPage();
    const candidateHeader = (data) => {
      pdf.setFontSize(12);
      // pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      pdf.setFillColor(140, 205, 232);
      pdf.rect(14, 7, 182, 7, 'F');
      pdf.text('新增基站', 100, 12);
    };
    const candidateTitle = ['編號', 'X座標', 'Y座標', 'Z座標'];
    const candidateData = [];
    for (let k = 0; k < this.inputBsList.length; k++) {
      candidateData.push([
        (k + 1), this.inputBsList[k][0], this.inputBsList[k][1], this.inputBsList[k][2]
      ]);
    }
    pdf.autoTable(candidateTitle, candidateData, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: candidateHeader
    });
    // 障礙物資訊
    pdf.addPage();
    const obstacleHeader = (data) => {
      pdf.setFontSize(12);
      // pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      pdf.setFillColor(140, 205, 232);
      pdf.rect(14, 7, 182, 7, 'F');
      pdf.text('障礙物資訊', 100, 12);
    };
    const obstacleTitle = ['編號', 'X座標', 'Y座標', '水平寬度(公尺)', '垂直長度(公尺)', '高度(公尺)'];
    const obstacleData = [];
    for (let k = 0; k < this.obstacleList.length; k++) {
      const item = this.obstacleList[k];
      obstacleData.push([(k + 1), item[0], item[1], item[2], item[3], item[4]]);
    }
    pdf.autoTable(obstacleTitle, obstacleData, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: obstacleHeader
    });
    // 行動終端分佈
    pdf.addPage();
    const ueHeader = (data) => {
      pdf.setFontSize(12);
      // pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      pdf.setFillColor(140, 205, 232);
      pdf.rect(14, 7, 182, 7, 'F');
      pdf.text('行動終端分佈', 100, 12);
    };
    const ueTitle = ['編號', 'X座標', 'Y座標', 'Z座標'];
    const ueData = [];
    for (let k = 0; k < this.ueList.length; k++) {
      ueData.push([
        (k + 1), this.ueList[k][0], this.ueList[k][1], this.ueList[k][2]
      ]);
    }
    pdf.autoTable(ueTitle, ueData, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: ueHeader
    });

    for (const id of list) {
      pdf.addPage();
      const data = <HTMLDivElement> area.querySelector(`#${id}`);
      await html2canvas(data).then(canvas => {
        // Few necessary setting options
        const imgWidth = 208;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const contentDataURL = canvas.toDataURL('image/png');
        const position = 0;
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      });
    }

    document.getElementById('pdf_area').style.display = 'none';
    this.authService.spinnerHide();
    pdf.save(`${taskName}_report.pdf`); // Generated PDF

  }

}
