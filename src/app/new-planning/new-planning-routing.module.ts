import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewPlanningComponent } from './new-planning.component';

const routes: Routes = [
  { path: 'new-planning', component: NewPlanningComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewPlanningRoutingModule { }
