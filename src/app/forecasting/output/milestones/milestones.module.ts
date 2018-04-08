import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { SharedModule } from '../../../shared.module';

import { MilestonesComponent } from './milestones.component';
import { ChartComponent } from './chart/chart.component';

@NgModule({
  imports: [
    SharedModule,
    NgxChartsModule
  ],
  declarations: [
    MilestonesComponent,
    ChartComponent,
  ],
  exports: [
    MilestonesComponent
  ]
})
export class MilestonesModule { }
