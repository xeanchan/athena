import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WirelessListRoutingModule } from './wireless-list-routing.module';
import { WirelessListComponent } from './wireless-list.component';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
<<<<<<< HEAD
=======
import { NewPlanningModule } from '../new-planning/new-planning.module';
import { TranslateModule } from '@ngx-translate/core';
>>>>>>> 726d13badcacc9ae59a8d67a79a4982174b2a3ea


@NgModule({
  declarations: [
    WirelessListComponent
  ],
  imports: [
    CommonModule,
    WirelessListRoutingModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatProgressBarModule,
<<<<<<< HEAD
    MatDialogModule
  ]
=======
    MatDialogModule,
    NewPlanningModule,
    TranslateModule
  ],
  providers: [ ]
>>>>>>> 726d13badcacc9ae59a8d67a79a4982174b2a3ea
})
export class WirelessListModule { }
