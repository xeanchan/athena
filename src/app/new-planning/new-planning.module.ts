import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewPlanningComponent } from './new-planning.component';
import { MatButtonToggleModule, MatIconModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { NewPlanningRoutingModule } from './new-planning-routing.module';
import {MatSelectModule} from '@angular/material/select';

@NgModule({
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatIconModule,
    NewPlanningRoutingModule,
    RouterModule,
    MatSelectModule
  ],
  declarations: [NewPlanningComponent],
  entryComponents: [NewPlanningComponent],
  exports: [NewPlanningComponent]
})
export class NewPlanningModule { }
