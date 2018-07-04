import { NgModule } from '@angular/core';

import { YnabConnectRoutingModule } from './ynab-connect-routing.module';
import { YnabConnectComponent } from './ynab-connect.component';
import { YnabConnectService } from './ynab-connect.service';

@NgModule({
  imports: [YnabConnectRoutingModule],
  exports: [],
  declarations: [YnabConnectComponent],
  providers: [YnabConnectService],
})
export class YnabConnectModule { }
