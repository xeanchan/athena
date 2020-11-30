import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SitePlanningComponent } from './site-planning.component';

const routes: Routes = [
  { path: '', component: SitePlanningComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SitePlanningRoutingModule { }
