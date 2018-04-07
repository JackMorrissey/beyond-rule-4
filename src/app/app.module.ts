import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MilestonesModule } from './milestones/milestones.module';
import { YnabModule } from './ynab/ynab.module';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    MilestonesModule,
    YnabModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
