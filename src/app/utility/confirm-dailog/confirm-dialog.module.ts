import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDailogComponent } from './confirm-dailog.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule
  ],
  declarations: [ ConfirmDailogComponent ],
  entryComponents: [ ConfirmDailogComponent ]
})
export class ConfirmDialogModule { }
