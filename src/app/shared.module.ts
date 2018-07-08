import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgbModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    HttpClientModule,
    NgbModule,
    RouterModule
  ],
  declarations: [],
  providers: [],
})
export class SharedModule { }
