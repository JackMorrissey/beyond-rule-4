import { Component, OnInit } from '@angular/core';

import { YnabApiService } from '../ynab-api/ynab-api.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
    standalone: false
})

export class HomeComponent implements OnInit {
  constructor(private ynabApiService: YnabApiService) { }

  public isAuthorized = false;

  ngOnInit() {
    this.ynabApiService.isAuthorized$
    .subscribe({
      next: (isAuthorized) => {
        this.isAuthorized = isAuthorized;
      }
    });
  }

  authorize() {
    this.ynabApiService.authorize();
  }
}
