import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { ForecastingModule } from './forecasting/forecasting.module';

import { AppComponent } from './app.component';




@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    ForecastingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
