import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './service/auth-guard.service';
import { LayoutComponent } from './layout/layout.component';
import { PdfComponent } from './site/pdf/pdf.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'wireless-list',
    pathMatch: 'full',
    // loadChildren: './wireless-list/wireless-list.module#WirelessListModule',
    canActivate: [AuthGuardService]
  },
  {
    path: 'logon',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule) // 登入
  },
  {
    path: 'wireless-list',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./wireless-list/wireless-list.module').then(m => m.WirelessListModule),
        canActivate: [AuthGuardService]
      }
    ]
  },
  {
    path: 'new-planning',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./new-planning/new-planning.module').then(m => m.NewPlanningModule),
        canActivate: [AuthGuardService]
      }
    ]
  },
  {
    path: 'site',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./site/site.module').then(m => m.SiteModule),
        canActivate: [AuthGuardService]
      }
    ]
  },
  {
    path: 'pdf',
    children: [
      {
        path: '',
        loadChildren: () => import('./site/pdf/pdf.module').then(m => m.PdfModule),
        canActivate: [AuthGuardService]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
