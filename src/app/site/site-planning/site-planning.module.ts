import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SitePlanningComponent } from './site-planning.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMoveableModule } from 'ngx-moveable';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatSidenavModule,
    MatButtonToggleModule,
    MatIconModule,
    MatExpansionModule,
    MatTabsModule,
    MatCheckboxModule,
    MatTooltipModule,
    NgxMoveableModule
  ],
  declarations: [SitePlanningComponent],
  exports: [SitePlanningComponent]
})
export class SitePlanningModule { }
