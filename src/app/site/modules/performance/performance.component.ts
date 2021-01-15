import { Component, OnInit, Input } from '@angular/core';
import { CalculateForm } from '../../../form/CalculateForm';

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss']
})
export class PerformanceComponent implements OnInit {

  constructor() { }

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
        this.result['layeredAverageSinr'][i],
        this.result['layeredAverageRsrp'][i]
      ]);
    }
  }

}
