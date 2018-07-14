import { Component, OnInit } from '@angular/core';

import { YnabApiService } from '../ynab-api/ynab-api.service';

@Component({
  selector: 'app-navigation',
  templateUrl: 'navigation.component.html'
})

export class NavigationComponent implements OnInit {
  isOpen = false;
  isAuthorized = false;

  constructor(private ynabApiService: YnabApiService) { }

  ngOnInit() {
    this.ynabApiService.isAuthorized$.subscribe({next: (isAuthorized) => this.isAuthorized = isAuthorized});
   }

  authorize() {
    this.ynabApiService.authorize();
  }

  logOut() {
    this.ynabApiService.clearToken();
  }
}
