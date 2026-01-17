import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared.module';

import { YnabComponent } from './ynab.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    FormsModule,
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
