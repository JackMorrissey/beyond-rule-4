import { NgModule } from '@angular/core';

import { MilestonesModule } from './milestones/milestones.module';
import { ForecastingOutputComponent } from './output.component';

@NgModule({
  imports: [MilestonesModule],
  exports: [ForecastingOutputComponent],
  declarations: [ForecastingOutputComponent],
  providers: [],
})
export class OutputModule { }
