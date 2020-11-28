import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewPlanningComponent } from './new-planning.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [NewPlanningComponent],
  entryComponents: [NewPlanningComponent],
  exports: [NewPlanningComponent]
})
export class NewPlanningModule { }
