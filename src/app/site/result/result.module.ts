import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultComponent } from './result.component';
import { RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatButtonToggleModule,
    MatSelectModule
  ],
  declarations: [ResultComponent]
})
export class ResultModule {
}
