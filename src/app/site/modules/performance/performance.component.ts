import { Component, OnInit, Input } from '@angular/core';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss']
})
export class PerformanceComponent implements OnInit {

  constructor(private translateService: TranslateService) { }

  result = {};
  calculateForm = new CalculateForm();
  /** 地圖切面 list */
  zValueList = [];

  ngOnInit(): void {
  }

  setData() {
    // 地圖切面 list
    const zValues = this.calculateForm.zValue.replace('[', '').replace(']', '').split(',');
    for (let i = 0; i < zValues.length; i++) {
      this.zValueList.push([
        zValues[i],
        this.result['layeredCoverage'][i],
        Number(this.result['layeredAverageSinr'][i]),
        Number(this.result['layeredAverageRsrp'][i])
      ]);
    }
  }

  parseNoData(val, isPercentage) {
    if (val == null || val === '') {
      return '-';
    } else {
      return Math.round(val * 1000) / 1000 + (isPercentage ? '%' : '');
    }
  }

}
