import { Component, OnInit } from '@angular/core';

import { YnabApiService } from '../ynab-api/ynab-api.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {
  constructor(private ynabApiService: YnabApiService) { }

  public isAuthorized = false;

  ngOnInit() {
    this.isAuthorized = this.ynabApiService.isAuthorized();
  }

  authorize() {
    this.ynabApiService.authorize();
  }
}
