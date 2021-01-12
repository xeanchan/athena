import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceComponent } from './performance.component';



@NgModule({
  declarations: [PerformanceComponent],
  imports: [
    CommonModule
  ],
  exports: [PerformanceComponent]
})
export class PerformanceModule { }
