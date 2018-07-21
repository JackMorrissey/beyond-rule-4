import { NgModule } from '@angular/core';

import { AboutComponent } from './about.component';
import { AboutRoutingModule } from './about-routing.module';

@NgModule({
  imports: [AboutRoutingModule],
  exports: [],
  declarations: [AboutComponent],
  providers: [],
})
export class AboutModule { }
