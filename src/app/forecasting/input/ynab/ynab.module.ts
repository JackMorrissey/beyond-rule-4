import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared.module';

import { YnabComponent } from './ynab.component';
import { MonthYearPickerComponent } from './month-year-picker.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MonthYearPickerComponent
  ],
  declarations: [
    YnabComponent
  ],
  exports: [
    YnabComponent,
  ],
  providers: [
  ]
})
export class YnabModule { }
