import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProposeComponent } from './propose.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [ProposeComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [ProposeComponent]
})
export class ProposeModule { }
