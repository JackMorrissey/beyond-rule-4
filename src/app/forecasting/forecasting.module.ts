import { NgModule } from '@angular/core';
import { InputModule } from './input/input.module';
import { OutputModule } from './output/output.module';

import { ForecastingComponent } from './forecasting.component';

@NgModule({
  imports: [
    InputModule,
    OutputModule
  ],
  exports: [ForecastingComponent],
  declarations: [ForecastingComponent],
  providers: [],
})
export class ForecastingModule { }
