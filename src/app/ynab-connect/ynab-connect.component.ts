import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { YnabApiService } from '../ynab-api/ynab-api.service';

declare var gtag: any;

@Component({
  selector: 'app-ynab-connect',
  templateUrl: 'ynab-connect.component.html'
})

export class YnabConnectComponent implements OnInit {
  constructor(private ynabApiService: YnabApiService, private router: Router) { }

  ngOnInit() {
    if (this.ynabApiService.findYnabToken()) {
      if (gtag) {
        gtag('event', 'authorize', {
          'event_category': 'YNAB Connect'
        });
      }
      this.router.navigate(['/forecasting']);
    }
  }

  authorize() {
    this.ynabApiService.authorize();
  }
}
