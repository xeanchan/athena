import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-signal-quality',
  templateUrl: './signal-quality.component.html',
  styleUrls: ['./signal-quality.component.scss']
})
export class SignalQualityComponent implements OnInit {

  constructor() { }

  @Input('result') result;

  ngOnInit(): void {
  }

}
