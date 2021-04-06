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
  showCal = true;
  showLoad = false;

  /** show loading */
  show() {
    this.showCal = false;
    this.showLoad = true;
    this.spinner.show();
  }

  /** hide loading */
  hide() {
    this.spinner.hide();
  }

  /** show loading, 有home link */
  showAsHome() {
    this.showLoad = false;
    this.showCal = true;
    this.showHome = true;
    this.spinner.show();
  }

  showCalculating() {
    this.showLoad = false;
    this.showCal = true;
    this.spinner.show();
  }

  home() {
    this.spinner.hide();
    this.router.navigate(['/']);
    // location.href = '';
  }

}
