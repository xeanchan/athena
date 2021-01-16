import { Component, OnInit, ViewChild } from '@angular/core';
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

  taskId = 'task_sel_26cc4b6e-7096-4202-aa39-500a1214df85_0';
  result = {};
  calculateForm: CalculateForm = new CalculateForm();

  @ViewChild('propose') propose: ProposeComponent;
  @ViewChild('quality') quality: SignalQualityComponent;
  @ViewChild('cover') cover: SignalCoverComponent;
  @ViewChild('strength') strength: SignalStrengthComponent;
  @ViewChild('performance') performance: PerformanceComponent;
  @ViewChild('statistics') statistics: StatisticsComponent;
  @ViewChild('siteInfo') siteInfo: SiteInfoComponent;

  ngOnInit() {
    // this.route.queryParams.subscribe(params => {
    //   this.taskId = params['taskId'];
    //   this.getResult();
    // });
    // this.getResult();

    // this.calculateForm = JSON.parse(sessionStorage.getItem('calculateForm'));
  }

  async export(taskId) {
    this.taskId = taskId;
    if (typeof this.taskId !== 'undefined') {
      const url = `${this.authService.API_URL}/completeCalcResult/${this.taskId}/${this.authService.userToken}`;
      this.http.get(url).subscribe(
        res => {
          document.getElementById('pdf_area').style.display = 'block';
          // console.log(res)
          this.calculateForm = res['input'];
          this.result = res['output'];

          this.propose.calculateForm = this.calculateForm;
          this.propose.result = this.result;
          this.propose.drawLayout(true);
          // 訊號品質圖
          this.quality.calculateForm = this.calculateForm;
          this.quality.draw(true);
          // 訊號覆蓋圖
          this.cover.calculateForm = this.calculateForm;
          this.cover.draw(true);
          // 訊號強度圖
          this.strength.calculateForm = this.calculateForm;
          this.strength.draw(true);
          // 統計資訊
          this.performance.calculateForm = this.calculateForm;
          this.performance.result = this.result;
          this.performance.setData();
          this.statistics.calculateForm = this.calculateForm;
          this.statistics.result = this.result;
          this.statistics.drawChart(true);

          this.siteInfo.calculateForm = this.calculateForm;
          this.siteInfo.result = this.result;
          console.log(this.result);
          window.setTimeout(() => {
            this.genericPDF(this.calculateForm.taskName);
          }, 500);
        }
      );
    }
  }

  /** export PDF */
  async genericPDF(taskName) {
    this.authService.spinnerShow();
    const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
    const area = document.querySelector('#pdf_area');
    const list = ['site_info', 'propose', 'signal', 'performace', 'statistics'];
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
    pdf.save(`${taskName}.pdf`); // Generated PDF
  }

}
