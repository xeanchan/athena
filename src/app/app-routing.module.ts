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
    path: 'site',
    component: LayoutComponent,
    children: [
      { path: 'site-planning', loadChildren: './site/site-planning/site-planning.module#SitePlanningModule', canActivate: [AuthGuardService] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
