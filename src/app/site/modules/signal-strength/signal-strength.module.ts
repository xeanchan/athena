import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalStrengthComponent } from './signal-strength.component';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [SignalStrengthComponent],
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  exports: [SignalStrengthComponent]
})
export class SignalStrengthModule { }
