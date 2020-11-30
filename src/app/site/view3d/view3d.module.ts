import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { View3dComponent } from './view3d.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [View3dComponent],
  exports: [View3dComponent]
})
export class View3dModule { }
