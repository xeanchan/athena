import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-propose',
  templateUrl: './propose.component.html',
  styleUrls: ['./propose.component.scss']
})
export class ProposeComponent implements OnInit {

  constructor() { }

  @Input('result') result;

  ngOnInit(): void {
  }

}
