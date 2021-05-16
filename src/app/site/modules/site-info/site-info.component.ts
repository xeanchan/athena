import { Component, OnInit, Input } from '@angular/core';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';

/**
 * 結果頁場域設定資訊
 */
@Component({
  selector: 'app-site-info',
  templateUrl: './site-info.component.html',
  styleUrls: ['./site-info.component.scss']
})
export class SiteInfoComponent implements OnInit {

  constructor(private translateService: TranslateService) { }

  /** 結果data */
  result = {};
  /** 結果form */
  calculateForm = new CalculateForm();
  /** 待選基站數量 */
  inputBsListCount = 0;
  /** 現有基站數量 */
  defaultBsCount = 0;
  /** 規劃目標 */
  planningObj = {
    isAverageSinr: false,
    isCoverage: false,
    isUeAvgSinr: false,
    isUeAvgThroughput: false,
    isUeTpByDistance: false
  };

  ngOnInit(): void {
    console.log(sessionStorage.getItem('planningObj'));
    if (sessionStorage.getItem('planningObj') != null) {
      this.planningObj = JSON.parse(sessionStorage.getItem('planningObj'));
      console.log(this.planningObj);
    }
    
  }

  /** parse 網路種類 */
  parseOB(type) {
    if (Number(type) === 0) {
      return '4G';
    } else if (Number(type) === 1) {
      return '5G';
    } else if (Number(type) === 2) {
      return 'Wifi';
    }
  }

  /** i18n replace 待選基站位置( 共{0}處 ) */
  getWaitSelect() {
    return this.translateService.instant('result.propose.wait_select_2')
    .replace('{0}', this.inputBsListCount);
  }

  /** i18n replace 現有基站(共{0}台) */
  getBsCount() {
    return this.translateService.instant('result.bs.count')
    .replace('{0}', this.defaultBsCount);
  }

}
