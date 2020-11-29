import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewPlanningComponent } from './new-planning.component';

@NgModule({
  imports: [
    CommonModule
  ],
<<<<<<< HEAD
  declarations: [NewPlanningComponent]
=======
  declarations: [NewPlanningComponent],
  entryComponents: [NewPlanningComponent],
  exports: [NewPlanningComponent]
>>>>>>> 726d13badcacc9ae59a8d67a79a4982174b2a3ea
})
export class NewPlanningModule { }
