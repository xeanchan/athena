import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceComponent } from './performance.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [PerformanceComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [PerformanceComponent]
})
export class PerformanceModule { }
