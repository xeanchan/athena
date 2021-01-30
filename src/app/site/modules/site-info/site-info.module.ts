import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteInfoComponent } from './site-info.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [SiteInfoComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [SiteInfoComponent]
})
export class SiteInfoModule { }
