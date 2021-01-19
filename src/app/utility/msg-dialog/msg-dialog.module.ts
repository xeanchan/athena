import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MsgDialogComponent } from './msg-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule
  ],
  declarations: [
    MsgDialogComponent
  ],
  entryComponents: [
    MsgDialogComponent
  ]
})
export class MsgDialogModule { }
