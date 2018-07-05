import { NgModule } from '@angular/core';

import { YnabConnectRoutingModule } from './ynab-connect-routing.module';
import { YnabConnectComponent } from './ynab-connect.component';

@NgModule({
  imports: [YnabConnectRoutingModule],
  exports: [],
  declarations: [YnabConnectComponent],
  providers: [],
})
export class YnabConnectModule { }
