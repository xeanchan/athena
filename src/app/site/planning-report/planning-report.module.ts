import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanningReportComponent } from './planning-report.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    MatButtonToggleModule,
    RouterModule
  ],
  declarations: [PlanningReportComponent]
})
export class PlanningReportModule { }
