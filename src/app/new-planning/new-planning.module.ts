import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewPlanningComponent } from './new-planning.component';
import { MatButtonToggleModule, MatIconModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatIconModule
  ],
  declarations: [NewPlanningComponent],
  entryComponents: [NewPlanningComponent],
  exports: [NewPlanningComponent]
})
export class NewPlanningModule { }
