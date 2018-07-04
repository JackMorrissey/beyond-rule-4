import { Component, OnInit } from '@angular/core';

import { YnabConnectService } from '../ynab-connect/ynab-connect.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {
  constructor(private ynabConnectService: YnabConnectService) { }

  public isAuthorized = false;

  ngOnInit() {
    this.isAuthorized = this.ynabConnectService.isAuthorized();
  }

  authorize() {
    this.ynabConnectService.authorize();
  }
}
