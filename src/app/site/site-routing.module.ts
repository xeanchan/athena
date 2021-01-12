import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanningReportComponent } from './planning-report/planning-report.component';
import { ResultComponent } from './result/result.component';
import { SitePlanningComponent } from './site-planning/site-planning.component';
import { View3dComponent } from './view3d/view3d.component';
import { PdfComponent } from './pdf/pdf.component';

const routes: Routes = [
  { path: 'site-planning', component: SitePlanningComponent },
  { path: 'view3d', component: View3dComponent },
  { path: 'result', component: ResultComponent },
  { path: 'planning-report', component: PlanningReportComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteRoutingModule { }
