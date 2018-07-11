import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared.module';

import { YnabComponent } from './ynab.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    SharedModule,
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
