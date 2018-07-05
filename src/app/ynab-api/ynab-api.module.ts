import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { YnabApiService } from './ynab-api.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
  ],
  exports: [
  ],
  providers: [
    YnabApiService,
  ]
})
export class YnabApiModule { }
