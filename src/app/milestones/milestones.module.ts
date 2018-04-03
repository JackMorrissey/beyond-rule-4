import 'd3';
import 'nvd3';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NvD3Module } from 'ng2-nvd3';

import { MilestonesComponent } from './milestones.component';
import { ChartComponent } from './chart/chart.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NvD3Module
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
