import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewPlanningComponent } from './new-planning.component';
import { RouterModule } from '@angular/router';
import { NewPlanningRoutingModule } from './new-planning-routing.module';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatIconModule,
    NewPlanningRoutingModule,
    RouterModule,
    MatRadioModule,
    TranslateModule
  ],
  declarations: [NewPlanningComponent],
  entryComponents: [NewPlanningComponent],
  exports: [NewPlanningComponent]
})
export class NewPlanningModule { }
