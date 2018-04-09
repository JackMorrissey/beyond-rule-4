import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared.module';
import { ForecastingOutputComponent } from './output.component';
import { MilestonesModule } from './milestones/milestones.module';
import { FiTextModule } from './fi-text/fi-text.module';

@NgModule({
  imports: [
    SharedModule,
    MilestonesModule,
    FiTextModule,
  ],
  exports: [ForecastingOutputComponent],
  declarations: [ForecastingOutputComponent],
  providers: [],
})
export class OutputModule { }
