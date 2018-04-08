import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared.module';
import { MilestonesModule } from './milestones/milestones.module';
import { ForecastingOutputComponent } from './output.component';

@NgModule({
  imports: [
    SharedModule,
    MilestonesModule,
  ],
  exports: [ForecastingOutputComponent],
  declarations: [ForecastingOutputComponent],
  providers: [],
})
export class OutputModule { }
