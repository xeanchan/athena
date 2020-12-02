import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SitePlanningComponent } from './site-planning.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { MatButtonToggleModule, MatIconModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatButtonToggleModule,
    MatIconModule,
    MatExpansionModule,
    MatTabsModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  declarations: [SitePlanningComponent],
  exports: [SitePlanningComponent]
})
export class SitePlanningModule { }
