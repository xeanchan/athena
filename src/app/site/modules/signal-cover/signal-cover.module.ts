import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalCoverComponent } from './signal-cover.component';



@NgModule({
  declarations: [SignalCoverComponent],
  imports: [
    CommonModule
  ],
  exports: [SignalCoverComponent]
})
export class SignalCoverModule { }
