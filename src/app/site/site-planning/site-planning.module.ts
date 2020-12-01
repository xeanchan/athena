import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SitePlanningComponent } from './site-planning.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatIconModule
  ],
  declarations: [SitePlanningComponent],
  exports: [SitePlanningComponent]
})
export class SitePlanningModule { }
