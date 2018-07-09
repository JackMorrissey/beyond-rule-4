import { NgModule } from '@angular/core';

import { SharedModule } from '../shared.module';
import { BeyondRoutingModule } from './beyond-routing.module';

import { BeyondComponent } from './beyond.component';

@NgModule({
  imports: [
    SharedModule,
    BeyondRoutingModule
  ],
  exports: [],
  declarations: [BeyondComponent],
  providers: [],
})
export class BeyondModule { }
