import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared.module';

import { YnabModule } from './ynab/ynab.module';

import { ForecastingInputComponent } from './input.component';
import { BasicInputComponent } from './basic/basic-input.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    SharedModule,
    YnabModule,
  ],
  exports: [ForecastingInputComponent],
  declarations: [
    ForecastingInputComponent,
    BasicInputComponent
  ],
  providers: [],
})
export class InputModule { }
