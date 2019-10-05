import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
const routes: Routes = [
  { path: 'login', loadChildren: './public/login/login.module#LoginPageModule' },
  {
    path: 'reset-password',
    loadChildren: './public/password-reset/password-reset.module#passwordResetPageModule'
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: './members/member-routing.module#MemberRoutingModule'
  },
  { path: 'admin-updater', loadChildren: './Admin/admin-updater/admin-updater.module#AdminUpdaterPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
