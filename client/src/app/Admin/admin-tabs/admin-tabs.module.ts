import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AdminTabsPage } from './admin-tabs.page';
const routes: Routes = [
  {
    path: 'admin-tabs',
    component: AdminTabsPage,
    children:[
      { path: 'users', loadChildren: '../users/users.module#UsersPageModule' },
      { path: 'admin-home', loadChildren: '../admin-home/admin-home.module#AdminHomePageModule'},
     // { path: 'home', loadChildren: '../members/home/home.module#HomePageModule' },
    ]
  },
  {
    path: '',
    redirectTo: 'admin-tabs/admin-home',
    pathMatch: 'full'
  },
  {
    path: 'users',
    redirectTo: 'admin-tabs/users',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AdminTabsPage]
})
export class AdminTabsPageModule {}
