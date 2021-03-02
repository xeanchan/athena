import { Component, OnInit, Input } from '@angular/core';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-site-info',
  templateUrl: './site-info.component.html',
  styleUrls: ['./site-info.component.scss']
})
export class SiteInfoComponent implements OnInit {

  constructor(private translateService: TranslateService) { }

  result = {};
  calculateForm = new CalculateForm();
  inputBsListCount = 0;
  defaultBsCount = 0;
  planningObj = {
    isAverageSinr: false,
    isCoverage: false,
    isUeAvgSinr: false,
    isUeAvgThroughput: false,
    isUeTpByDistance: false
  };

  ngOnInit(): void {
    console.log(sessionStorage.getItem('planningObj'))
    if (sessionStorage.getItem('planningObj') != null) {
      this.planningObj = JSON.parse(sessionStorage.getItem('planningObj'));
      console.log(this.planningObj)
    }
    
  }

  parseOB(type) {
    if (type === '0') {
      return '5G';
    } else if (type === '1') {
      return '4G';
    } else if (type === '2') {
      return 'WIFI';
    }
  }

}
