import { NgModule } from '@angular/core';

import { SharedModule } from '../../../shared.module';

import { FiTextComponent } from './fi-text.component';

@NgModule({
  imports: [SharedModule],
  exports: [FiTextComponent],
  declarations: [FiTextComponent],
  providers: [],
})
export class FiTextModule { }
