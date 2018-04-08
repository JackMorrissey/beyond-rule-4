import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    BrowserAnimationsModule,
  ],
  exports: [
    CommonModule,
    HttpModule,
  ],
  declarations: [],
  providers: [],
})
export class SharedModule { }
