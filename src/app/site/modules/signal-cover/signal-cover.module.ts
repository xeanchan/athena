import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalCoverComponent } from './signal-cover.component';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [SignalCoverComponent],
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  exports: [SignalCoverComponent]
})
export class SignalCoverModule { }
