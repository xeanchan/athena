import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsComponent } from './statistics.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [StatisticsComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [StatisticsComponent]
})
export class StatisticsModule { }
