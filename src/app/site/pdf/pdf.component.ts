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
import { FormService } from '../../service/form.service';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss']
})
export class PdfComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private formService: FormService,
    private jsPDFFontService: JsPDFFontService,
    private http: HttpClient) { }

  taskId = 'task_sel_2debd312-a5aa-48ab-a131-0518fc3c714e_1';
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
    // this.export(this.taskId, false);

    // this.calculateForm = JSON.parse(sessionStorage.getItem('calculateForm'));
  }

  /**
   * @param taskId
   * @param isHst 歷史紀錄
   */
  async export(taskId, isHst) {
    this.taskId = taskId;
    this.authService.spinnerShow();
    if (typeof this.taskId !== 'undefined') {
      let url;
      if (isHst) {
        url = `${this.authService.API_URL}/historyDetail/${this.authService.userId}/`;
        url += `${this.authService.userToken}/${taskId}`;
      } else {
        url = `${this.authService.API_URL}/completeCalcResult/${this.taskId}/${this.authService.userToken}`;
      }
      this.http.get(url).subscribe(
        res => {
          if (document.getElementById('pdf_area') != null) {
            document.getElementById('pdf_area').style.display = 'block';
          }
          if (isHst) {
            // 歷史紀錄
            this.result = this.formService.setHstOutputToResultOutput(res['output']);
            this.result['createTime'] = res['createtime'];
            const form = res;
            delete form['output'];
            this.calculateForm = this.formService.setHstToForm(form);
            this.result['inputWidth'] = this.calculateForm.width;
            this.result['inputHeight'] = this.calculateForm.height;
          } else {
            this.calculateForm = res['input'];
            this.result = res['output'];
          }
          // 現有基站
          const defaultBsAry = this.calculateForm.defaultBs
          .replace(new RegExp('\\[', 'gi'), '').replace(new RegExp('\\]', 'gi'), '').split('|');
          for (const item of defaultBsAry) {
            this.defaultBs.push(item.split(','));
          }
          // 新增基站
          const candidateBsAry = this.calculateForm.candidateBs
          .replace(new RegExp('\\[', 'gi'), '').replace(new RegExp('\\]', 'gi'), '').split('|');
          for (const item of candidateBsAry) {
            this.inputBsList.push(item.split(','));
          }
          this.result['inputBsList'] = this.inputBsList;
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
              this.siteInfo.inputBsListCount = this.inputBsList.length;
              this.siteInfo.defaultBsCount = this.defaultBs.length;
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
    const pdf = new jsPDF('p', 'mm', 'a4', true); // A4 size page of PDF
    // 設定字型
    this.jsPDFFontService.AddFontArimo(pdf);
    let defaultBsCount = 0;
    const defaultBs = this.calculateForm.defaultBs.split('|');
    if (defaultBs[0] !== '') {
      defaultBsCount = defaultBs.length;
    }

    const area = document.querySelector('#pdf_area');
    const list = [];
    for (let k = 0; k < this.zValues.length; k++) {
      list.push(`signal_${k}`);
    }
    // 基站資訊
    let pos = 10;
    const margin = 8;
    const leftStart = 25;
    pdf.setFontStyle('normal');
    pdf.setFontSize(17);
    pdf.text(14, pos, `專案名稱：${this.calculateForm['taskName']}`);
    pos += margin;
    pdf.setFontSize(14);
    pdf.text(14, pos, `規劃時間：${this.result['createTime']}`);
    pos += margin;
    pdf.text(14, pos, `場域規劃設置：`);
    pdf.setFillColor(255, 255, 255);
    pdf.setLineWidth(0.1);
    pdf.rect(14, pos + (margin / 2), 182, 175);
    pos += margin + 5;
    pdf.text(20, pos, `規劃目標：`);
    pos += margin;
    pdf.text(leftStart, pos, `不限制增加基站數量，以達到UE平均下行throughput最大.`);
    pos += margin;
    pdf.text(20, pos, `場域大小：`);
    pos += margin;
    pdf.text(leftStart, pos, `水平寬度： ${this.result['inputWidth']} 公尺`);
    pos += margin;
    pdf.text(leftStart, pos, `垂直長度： ${this.result['inputHeight']} 公尺`);
    pos += margin;
    pdf.text(leftStart, pos, `高度： ${this.calculateForm['altitude']} 公尺`);
    pos += margin;
    pdf.text(leftStart, pos, `切面高度： ${this.calculateForm.zValue.replace(new RegExp(',', 'gi'), ', ')} 公尺`);
    pos += margin;
    pdf.text(20, pos, `基站資訊：`);
    pos += margin;
    pdf.text(leftStart, pos, `待選基站位置： 共${this.inputBsList.length}處`);
    pos += margin;
    pdf.text(leftStart, pos, `現有基站： 共${defaultBsCount}台`);
    pos += margin;
    pdf.text(leftStart, pos, `發射功率範圍： ${this.calculateForm.powerMinRange} dBm ~ ${this.calculateForm.powerMaxRange} dBm`);
    pos += margin;
    pdf.text(leftStart, pos, `可分配波束編號範圍： 0 ~ 30`);
    pos += margin;
    pdf.text(leftStart, pos, `LTE系統頻寬(MHz)： ${this.calculateForm.bandwidth} MHz`);
    pos += margin;
    pdf.text(leftStart, pos, `LTE系統頻率(MHz)： ${this.calculateForm.frequency} MHz`);
    pos += margin;
    pdf.text(20, pos, `演算法參數：`);
    pos += margin;
    pdf.text(leftStart, pos, `C值： ${this.calculateForm.mctsC}`);
    pos += margin;
    pdf.text(leftStart, pos, `天線數： ${this.calculateForm.mctsMimo}`);
    pos += margin;
    pdf.text(leftStart, pos, `氣溫： ${this.calculateForm.mctsTemperature}`);
    pos += margin;
    pdf.text(leftStart, pos, `節點模擬時間限制： ${this.calculateForm.mctsTime}`);
    pos += margin;
    pdf.text(leftStart, pos, `本次規劃之時間限制： ${this.calculateForm.mctsTestTime}`);
    pos += margin;
    pdf.text(leftStart, pos, `本次規劃之模擬次數上限： ${this.calculateForm.mctsTotalTime}`);

    // 現有基站
    const defaultBsTitle = ['編號', 'X座標', 'Y座標', 'Z座標'];
    const defaultBsHeader = (data) => {
      pdf.setFontSize(12);
      pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      pdf.setFillColor(42, 58, 93);
      pdf.rect(14, pos + 13, 182, 7, 'F');
      pdf.text('現有基站', 100, pos + 18);
    };
    const defaultBsData = [];
    for (let k = 0; k < this.defaultBs.length; k++) {
      if (this.defaultBs[k][0] === '') {
        defaultBsData.push([{ content: '未設置現有基站資訊', colSpan: 4, styles: { halign: 'center' } }]);
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
      startY: pos + 20,
      halign: 'center'
    });
    // 新增基站
    pdf.addPage();
    const candidateHeader = (data) => {
      pdf.setFontSize(12);
      pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      pdf.setFillColor(42, 58, 93);
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
      pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      pdf.setFillColor(42, 58, 93);
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
    pdf.page++;
    const ueHeader = (data) => {
      pdf.setFontSize(12);
      pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      pdf.setFillColor(42, 58, 93);
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

    pdf.addPage();
    const proposeData = <HTMLDivElement> area.querySelector(`#propose`);
    await html2canvas(proposeData).then(canvas => {
      // Few necessary setting options
      const imgWidth = 182;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const contentDataURL = canvas.toDataURL('image/png');
      const position = 10;
      pdf.addImage(contentDataURL, 'PNG', 14, position, imgWidth, imgHeight, undefined, 'FAST');
    });

    for (const id of list) {
      pdf.addPage();
      const data = <HTMLDivElement> area.querySelector(`#${id}`);
      await html2canvas(data).then(canvas => {
        // Few necessary setting options
        const imgWidth = 182;
        let imgHeight = canvas.height * imgWidth / canvas.width;
        if (imgHeight > 260) {
          imgHeight = 260;
        }
        const contentDataURL = canvas.toDataURL('image/png');
        const position = 10;
        pdf.addImage(contentDataURL, 'PNG', 14, position, imgWidth, imgHeight, undefined, 'FAST');
      });
    }
    // 預估效能
    pdf.addPage();
    const performanceHeader = (data) => {
      pdf.setFontSize(12);
      pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      pdf.setFillColor(42, 58, 93);
      pdf.rect(14, 7, 182, 7, 'F');
      pdf.text('預估效能', 100, 12);
    };
    const p1Title = ['場域覆蓋率', '場域平均 SINR', '場域平均 RSRP', ''];
    const p1Data = [[
      this.result['coverage'], `${Math.round(this.result['averageSinr'])}db`,
      `${Math.round(this.result['averageRsrp'])}dBm`, ''
    ]];
    pdf.autoTable(p1Title, p1Data, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: performanceHeader
    });
    const p2Title = ['UE 覆蓋率', 'UE 平均 SINR', 'UE 平均 RSRP', 'UE 平均 Throughput'];
    const p2Data = [[
      this.result['ueCoverage'].toString(), `${Math.round(this.result['ueAverageSinr'] * 1000) / 1000} `,
      `${Math.round(this.result['ueAverageRsrp'] * 1000) / 1000} `, `${Math.round(this.result['ueThroughput'] * 1000) / 1000} `
    ]];
    pdf.autoTable(p2Title, p2Data, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      margin: { top: 0 }
    });

    const p3Title = ['地圖切面(高度)', '切面覆蓋率', '切面平均 SINR', '切面平均 RSRP'];
    const p3Data = [];
    for (let k = 0; k < this.zValues.length; k++) {
      p3Data.push([
        `${this.zValues[k]}公尺`,
        `${this.result['layeredCoverage'][k]}%`,
        `${Math.round(this.result['layeredAverageSinr'][k] * 1000) / 1000}db`,
        `${Math.round(this.result['layeredAverageRsrp'][k] * 1000) / 1000}dBm`
      ]);
    }
    pdf.autoTable(p3Title, p3Data, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      margin: { top: 0 }
    });

    // 統計資訊
    const statisticsList = ['statistics'];
    for (const id of statisticsList) {
      pdf.addPage();
      pdf.page++;
      const data = <HTMLDivElement> area.querySelector(`#${id}`);
      await html2canvas(data).then(canvas => {
        // Few necessary setting options
        const imgWidth = 182;
        const imgHeight = 260;
        const contentDataURL = canvas.toDataURL('image/png');
        const position = 10;
        pdf.addImage(contentDataURL, 'PNG', 14, position, imgWidth, imgHeight, undefined, 'FAST');
      });
    }

    const pageCount = pdf.internal.getNumberOfPages();
    for (let k = 0; k < pageCount; k++) {
      pdf.setFontSize(12);
      pdf.setFontStyle({ font: 'NotoSansCJKtc', fontStyle: 'normal' });
      pdf.setPage(k);
      pdf.text(170, 285, `Page ${pdf.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`);
    }

    document.getElementById('pdf_area').style.display = 'none';
    this.authService.spinnerHide();
    pdf.save(`${taskName}_report.pdf`); // Generated PDF

  }

}
