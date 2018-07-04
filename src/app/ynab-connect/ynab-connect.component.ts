import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { YnabConnectService } from './ynab-connect.service';

@Component({
  selector: 'app-ynab-connect',
  templateUrl: 'ynab-connect.component.html'
})

export class YnabConnectComponent implements OnInit {
  constructor(private ynabConnectService: YnabConnectService, private router: Router) { }

  ngOnInit() {
    if (this.ynabConnectService.findYnabToken()) {
      this.router.navigate(['/']);
    }
  }

  authorize() {
    this.ynabConnectService.authorize();
  }
}
