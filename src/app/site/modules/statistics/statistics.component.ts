import { Component, OnInit, Input } from '@angular/core';
import { CalculateForm } from '../../../form/CalculateForm';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  constructor() { }

  result = {};
  calculateForm = new CalculateForm();

  ngOnInit(): void {
  }

}
