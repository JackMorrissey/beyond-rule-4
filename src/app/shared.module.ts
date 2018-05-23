import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    BrowserAnimationsModule,
    NgbModule,
  ],
  exports: [
    CommonModule,
    HttpModule,
    NgbModule,
  ],
  declarations: [],
  providers: [],
})
export class SharedModule { }
