import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';

import { HomeModule } from './home/home.module';
import { ForecastingModule } from './forecasting/forecasting.module';
import { YnabConnectModule } from './ynab-connect/ynab-connect.module';
import { YnabApiModule } from './ynab-api/ynab-api.module';

import { AppComponent } from './app.component';




@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    HomeModule,
    ForecastingModule,
    YnabConnectModule,
    YnabApiModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
