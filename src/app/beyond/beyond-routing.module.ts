import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BeyondComponent } from './beyond.component';

const routes: Routes = [
  { path: 'beyond', component: BeyondComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BeyondRoutingModule { }

export const routedComponents = [BeyondComponent];
