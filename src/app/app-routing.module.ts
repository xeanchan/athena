import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './service/auth-guard.service';
import { LayoutComponent } from './layout/layout.component';


export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'wireless-list',
    pathMatch: 'full',
    // loadChildren: './wireless-list/wireless-list.module#WirelessListModule',
    canActivate: [AuthGuardService]
  },
  { path: 'logon', loadChildren: './login/login.module#LoginModule' }, // 登入
  {
    path: 'wireless-list',
    component: LayoutComponent,
    children: [
      { path: '', loadChildren: './wireless-list/wireless-list.module#WirelessListModule', canActivate: [AuthGuardService] },
    ]
  },
  {
    path: 'new-planning',
    component: LayoutComponent,
    children: [
      { path: '', loadChildren: './new-planning/new-planning.module#NewPlanningModule', canActivate: [AuthGuardService] },
    ]
  },
  {
    path: 'site',
    component: LayoutComponent,
    children: [
      { path: '', loadChildren: './site/site.module#SiteModule', canActivate: [AuthGuardService] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
