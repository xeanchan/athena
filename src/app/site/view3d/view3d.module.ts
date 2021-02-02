import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { View3dComponent } from './view3d.component';
import { RouterModule } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSelectModule,
    TranslateModule,
    MatButtonToggleModule
  ],
  declarations: [View3dComponent],
  exports: [View3dComponent]
})
export class View3dModule { }
