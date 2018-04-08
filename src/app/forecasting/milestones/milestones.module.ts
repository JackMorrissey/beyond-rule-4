import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MilestonesComponent } from './milestones.component';
import { ChartComponent } from './chart/chart.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
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
