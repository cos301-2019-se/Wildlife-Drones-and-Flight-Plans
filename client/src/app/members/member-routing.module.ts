import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
 
const routes: Routes = [
  {path: 'home', loadChildren: './home/home.module#HomePageModule'},
  { path: 'test', loadChildren: './test/test.module#TestPageModule' }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemberRoutingModule { }