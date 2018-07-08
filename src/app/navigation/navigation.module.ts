import { NgModule } from '@angular/core';

import { SharedModule } from '../shared.module';

import { NavigationComponent } from './navigation.component';

@NgModule({
  imports: [SharedModule],
  exports: [NavigationComponent],
  declarations: [NavigationComponent],
  providers: [],
})
export class NavigationModule { }
