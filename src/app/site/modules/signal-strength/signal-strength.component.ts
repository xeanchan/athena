import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-signal-strength',
  templateUrl: './signal-strength.component.html',
  styleUrls: ['./signal-strength.component.scss']
})
export class SignalStrengthComponent implements OnInit {

  constructor() { }

  @Input('result') result;

  ngOnInit(): void {
  }

}
