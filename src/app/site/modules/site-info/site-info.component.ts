import { Component, OnInit, Input } from '@angular/core';
import { CalculateForm } from '../../../form/CalculateForm';

@Component({
  selector: 'app-site-info',
  templateUrl: './site-info.component.html',
  styleUrls: ['./site-info.component.scss']
})
export class SiteInfoComponent implements OnInit {

  constructor() { }

  result = {};
  calculateForm = new CalculateForm();
  inputBsListCount = 0;
  defaultBsCount = 0;

  ngOnInit(): void {
  }

}
