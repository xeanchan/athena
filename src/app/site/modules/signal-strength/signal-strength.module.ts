import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalStrengthComponent } from './signal-strength.component';



@NgModule({
  declarations: [SignalStrengthComponent],
  imports: [
    CommonModule
  ],
  exports: [SignalStrengthComponent]
})
export class SignalStrengthModule { }
