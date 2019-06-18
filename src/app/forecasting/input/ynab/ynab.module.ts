import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared.module';

import { YnabComponent } from './ynab.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    SharedModule,
    FormsModule
  ],
  declarations: [
    YnabComponent,
  ],
  exports: [
    YnabComponent,
  ],
  providers: [
  ]
})
export class YnabModule { }
