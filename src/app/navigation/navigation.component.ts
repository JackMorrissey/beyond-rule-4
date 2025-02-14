import { Component, OnInit } from '@angular/core';

import { YnabApiService } from '../ynab-api/ynab-api.service';

@Component({
    selector: 'app-navigation',
    templateUrl: 'navigation.component.html',
    standalone: false
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
    window.location.reload();
  }
}
