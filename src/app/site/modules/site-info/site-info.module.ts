import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteInfoComponent } from './site-info.component';



@NgModule({
  declarations: [SiteInfoComponent],
  imports: [
    CommonModule
  ],
  exports: [SiteInfoComponent]
})
export class SiteInfoModule { }
