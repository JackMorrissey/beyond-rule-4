import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { ReactiveFormsModule } from '@angular/forms';

import { ForecastingInputComponent } from './input.component';
import { BasicInputComponent } from './basic/basic-input.component';

@NgModule({
  imports: [
    SharedModule,
    ReactiveFormsModule
  ],
  exports: [ForecastingInputComponent],
  declarations: [
    ForecastingInputComponent,
    BasicInputComponent
  ],
  providers: [],
})
export class InputModule { }
