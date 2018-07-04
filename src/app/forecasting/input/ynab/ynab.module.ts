import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { YnabService } from './ynab.service';
import { YnabComponent } from './ynab.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  declarations: [
    YnabComponent,
  ],
  exports: [
    YnabComponent,
  ],
  providers: [
    YnabService,
  ]
})
export class YnabModule { }
