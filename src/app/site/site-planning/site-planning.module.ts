import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SitePlanningRoutingModule } from './site-planning-routing.module';
import { SitePlanningComponent } from './site-planning.component';
import { MatSidenavModule } from '@angular/material/sidenav';

@NgModule({
  imports: [
    CommonModule,
    SitePlanningRoutingModule,
    MatSidenavModule
  ],
  declarations: [SitePlanningComponent]
})
export class SitePlanningModule { }
