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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { ColorPickerModule, ColorPickerDirective } from 'ngx-color-picker';
import { MatRadioModule } from '@angular/material/radio';
import {MatInputModule} from '@angular/material/input';
import { MsgDialogModule } from '../../utility/msg-dialog/msg-dialog.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatSidenavModule,
    MatButtonToggleModule,
    MatIconModule,
    MatExpansionModule,
    MatTabsModule,
    MatCheckboxModule,
    MatTooltipModule,
    NgxMoveableModule,
    MatMenuModule,
    TranslateModule,
    ColorPickerModule,
    MatRadioModule,
    MatInputModule,
    MsgDialogModule
  ],
  declarations: [SitePlanningComponent],
  exports: [SitePlanningComponent],
  providers: [ColorPickerDirective]
})
export class SitePlanningModule { }
