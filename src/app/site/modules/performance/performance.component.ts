import { Component, OnInit, Input } from '@angular/core';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';

/**
 * 結果頁效能分析
 */
@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss']
})
export class PerformanceComponent implements OnInit {

  constructor(private translateService: TranslateService) { }
  
  /** 結果資料 */
  result = {};
  /** 結果form */
  calculateForm = new CalculateForm();
  /** 地圖切面 list */
  zValueList = [];

  ngOnInit(): void {
  }

  /** set data */
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

  /** parse無資料為 - */
  parseNoData(val, isPercentage, type) {
    if (val == null || val === '') {
      return '-';
    } else {
      let result = Math.round(val * 1000) / 1000 + (isPercentage ? '%' : '');
      if (type === 'ueAverageRsrp') {
        result += 'dBm';
      } else if (type === 'ueAverageSinr') {
        result += 'dB';
      } else if (type === 'ueThroughput') {
        result += 'Mbps';
      }
      return result;
    }
  }

}
