import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { YnabComponent } from './ynab.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
