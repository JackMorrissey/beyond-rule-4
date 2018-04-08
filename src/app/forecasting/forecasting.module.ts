import { NgModule } from '@angular/core';
import { MilestonesModule } from './milestones/milestones.module';
import { YnabModule } from './ynab/ynab.module';

import { ForecastingComponent } from './forecasting.component';

@NgModule({
  imports: [
    MilestonesModule,
    YnabModule
  ],
  exports: [ForecastingComponent],
  declarations: [ForecastingComponent],
  providers: [],
})
export class ForecastingModule { }
