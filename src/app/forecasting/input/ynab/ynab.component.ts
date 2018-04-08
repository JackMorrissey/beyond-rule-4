import { Component, OnInit } from '@angular/core';

import { Account } from 'ynab';
import { YnabService } from './ynab.service';

@Component({
  selector: 'app-ynab',
  templateUrl: 'ynab.component.html'
})

export class YnabComponent implements OnInit {
  public budgets;
  public budget;
  public months;
  public accounts;
  public netWorth: number;
  constructor(private ynabService: YnabService) { }

  async ngOnInit() {
    this.budgets = await this.ynabService.getBudgets();
    this.budget = this.budgets[0];
    const budgetId = this.budget.id;
    this.months = await this.ynabService.getMonths(budgetId);
    this.accounts = await this.ynabService.getAccounts(budgetId);
    this.netWorth = this.getNetWorth(this.accounts);
  }


  getNetWorth(allAccounts: Account[]) {
    if (!allAccounts || !allAccounts.length) {
      return 0;
    }

    return allAccounts.map(account => {
      return account.closed ? 0 : account.cleared_balance;
    }).reduce((prev, next) => {
      return prev + next;
    });
  }

}
