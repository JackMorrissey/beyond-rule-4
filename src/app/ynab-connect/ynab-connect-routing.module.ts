import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { YnabConnectComponent } from './ynab-connect.component';

const routes: Routes = [
  { path: 'connect', component: YnabConnectComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class YnabConnectRoutingModule { }

export const routedComponents = [YnabConnectComponent];
