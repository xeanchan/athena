import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WirelessListRoutingModule } from './wireless-list-routing.module';
import { WirelessListComponent } from './wireless-list.component';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';


@NgModule({
  declarations: [WirelessListComponent],
  imports: [
    CommonModule,
    WirelessListRoutingModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatProgressBarModule,
    MatDialogModule
  ]
})
export class WirelessListModule { }
