import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceModule } from '../modules/performance/performance.module';
import { ProposeModule } from '../modules/propose/propose.module';
import { SignalCoverModule } from '../modules/signal-cover/signal-cover.module';
import { SignalQualityModule } from '../modules/signal-quality/signal-quality.module';
import { SignalStrengthModule } from '../modules/signal-strength/signal-strength.module';
import { SiteInfoModule } from '../modules/site-info/site-info.module';
import { StatisticsModule } from '../modules/statistics/statistics.module';
import { PdfComponent } from './pdf.component';
import { RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { PdfRoutingModule } from './pdf-routing.module';



@NgModule({
  declarations: [PdfComponent],
  imports: [
    CommonModule,
    PdfRoutingModule,
    RouterModule,
    MatButtonToggleModule,
    PerformanceModule,
    ProposeModule,
    SignalCoverModule,
    SignalQualityModule,
    SignalStrengthModule,
    SiteInfoModule,
    StatisticsModule,
    TranslateModule
  ],
  exports: [PdfComponent]
})
export class PdfModule { }
