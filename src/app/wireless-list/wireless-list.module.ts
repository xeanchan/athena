import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WirelessListRoutingModule } from './wireless-list-routing.module';
import { WirelessListComponent } from './wireless-list.component';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { NewPlanningModule } from '../new-planning/new-planning.module';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { PdfModule } from '../site/pdf/pdf.module';
import { MsgDialogModule } from '../utility/msg-dialog/msg-dialog.module';
import { ConfirmDialogModule } from '../utility/confirm-dailog/confirm-dialog.module';


@NgModule({
  declarations: [
    WirelessListComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    WirelessListRoutingModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatProgressBarModule,
    MatDialogModule,
    NewPlanningModule,
    TranslateModule,
    MsgDialogModule,
    PdfModule
  ],
  providers: [ ]
})
export class WirelessListModule { }
