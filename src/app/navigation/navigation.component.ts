import { Component, OnInit } from '@angular/core';

import { YnabApiService } from '../ynab-api/ynab-api.service';

@Component({
    selector: 'app-navigation',
    templateUrl: 'navigation.component.html',
    standalone: false
})

export class NavigationComponent implements OnInit {
  navbarClass: string = 'bg-light'; // Default to light theme
  buttonClass: string = 'btn-outline-dark'; // Default to dark color
  isOpen = false;
  isAuthorized = false;

  constructor(private ynabApiService: YnabApiService) { }

  ngOnInit() {
    const theme = document.documentElement.getAttribute('data-bs-theme');
    this.navbarClass = theme === 'dark' ? 'bg-dark' : 'bg-light';
    this.buttonClass = theme === 'dark' ? 'btn-outline-light' : 'btn-outline-dark';
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
