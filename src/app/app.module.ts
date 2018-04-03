import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MilestonesModule } from './milestones/milestones.module';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    MilestonesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
