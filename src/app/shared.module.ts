import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faCheckSquare } from '@fortawesome/free-regular-svg-icons';
import {
  faRocket,
  faForward,
  faRunning,
  faExternalLinkSquareAlt,
  faInfoCircle,
  faCheckCircle,
  faSync,
  faPlusCircle,
  faKey,
  faCaretSquareDown,
} from '@fortawesome/free-solid-svg-icons';

@NgModule({
  exports: [CommonModule, NgbModule, RouterModule, FontAwesomeModule],
  declarations: [],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    NgbModule,
    RouterModule,
    FontAwesomeModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class SharedModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(
      faCheckSquare,
      faRocket,
      faForward,
      faRunning,
      faExternalLinkSquareAlt,
      faInfoCircle,
      faCheckCircle,
      faSync,
      faPlusCircle,
      faKey,
      faCaretSquareDown
    );
  }
}
