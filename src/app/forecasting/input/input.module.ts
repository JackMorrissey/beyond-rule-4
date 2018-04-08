import { NgModule } from '@angular/core';

import { ForecastingInputComponent } from './input.component';
import { BasicInputComponent } from './basic/basic-input.component';

@NgModule({
  imports: [],
  exports: [ForecastingInputComponent],
  declarations: [
    ForecastingInputComponent,
    BasicInputComponent
  ],
  providers: [],
})
export class InputModule { }
