import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from './spinner.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgxSpinnerModule,
    TranslateModule
  ],
  exports: [
    SpinnerComponent
  ],
  declarations: [ SpinnerComponent ],
  entryComponents: [ SpinnerComponent ]
})
export class SpinnerModule { }
