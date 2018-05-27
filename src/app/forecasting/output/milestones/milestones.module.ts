import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { SharedModule } from '../../../shared.module';

import { MilestonesComponent } from './milestones.component';
import { ChartComponent } from './chart/chart.component';
import { TextComponent } from './text/text.component';

@NgModule({
  imports: [
    SharedModule,
    NgxChartsModule
  ],
  declarations: [
    MilestonesComponent,
    ChartComponent,
    TextComponent,
  ],
  exports: [
    MilestonesComponent
  ]
})
export class MilestonesModule { }
