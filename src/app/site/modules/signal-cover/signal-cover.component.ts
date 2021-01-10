import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-signal-cover',
  templateUrl: './signal-cover.component.html',
  styleUrls: ['./signal-cover.component.scss']
})
export class SignalCoverComponent implements OnInit {

  constructor() { }

  @Input('result') result;

  ngOnInit(): void {
  }

}
