import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {

  constructor(public spinner: NgxSpinnerService, private router: Router) { }

  showHome = false;

  /** show loading */
  show() {
    this.spinner.show();
  }

  /** hide loading */
  hide() {
    this.spinner.hide();
  }

  /** show loading, 有home link */
  showAsHome() {
    this.showHome = true;
    this.spinner.show();
  }

  home() {
    this.spinner.hide();
    location.href = '';
  }

}
