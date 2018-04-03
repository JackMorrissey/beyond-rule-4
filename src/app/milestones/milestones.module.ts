import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MilestonesComponent } from './milestones.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    MilestonesComponent,
  ],
  exports: [
    MilestonesComponent
  ]
})
export class MilestonesModule { }
