import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalQualityComponent } from './signal-quality.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [SignalQualityComponent],
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  exports: [SignalQualityComponent]
})
export class SignalQualityModule { }
