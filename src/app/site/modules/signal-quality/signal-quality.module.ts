import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalQualityComponent } from './signal-quality.component';



@NgModule({
  declarations: [SignalQualityComponent],
  imports: [
    CommonModule
  ],
  exports: [SignalQualityComponent]
})
export class SignalQualityModule { }
