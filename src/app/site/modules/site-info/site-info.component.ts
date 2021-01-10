import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-site-info',
  templateUrl: './site-info.component.html',
  styleUrls: ['./site-info.component.scss']
})
export class SiteInfoComponent implements OnInit {

  constructor() { }

  @Input('result') result;
  @Input('calculateForm') calculateForm;

  ngOnInit(): void {
  }

}
