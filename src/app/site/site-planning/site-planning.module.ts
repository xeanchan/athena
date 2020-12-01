import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SitePlanningComponent } from './site-planning.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
<<<<<<< HEAD
import { MatButtonToggleModule, MatIconModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';
=======
import { MatIconModule } from '@angular/material';
>>>>>>> ce635783af99d194da42939a01fec6bf5c4edd67

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
<<<<<<< HEAD
    MatButtonToggleModule,
    MatIconModule,
    MatExpansionModule
=======
    MatIconModule
>>>>>>> ce635783af99d194da42939a01fec6bf5c4edd67
  ],
  declarations: [SitePlanningComponent],
  exports: [SitePlanningComponent]
})
export class SitePlanningModule { }
