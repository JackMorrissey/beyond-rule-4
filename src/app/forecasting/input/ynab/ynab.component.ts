import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as ynab from 'ynab';

import { YnabService } from './ynab.service';
import { CalculateInput } from '../../models/calculate-input.model';

@Component({
  selector: 'app-ynab',
  templateUrl: 'ynab.component.html'
})

export class YnabComponent implements OnInit {
  @Output() calculateInputChange = new EventEmitter<CalculateInput>();

  public budgets: ynab.BudgetSummary[];
  public budget: ynab.BudgetSummary;
  public months;
  public currentMonth: ynab.MonthDetail;
  public accounts: ynab.Account[];

  public netWorth: number;
  public monthlyExpenses: number;
  public annualExpenses: number;

  constructor(private ynabService: YnabService) { }

  async ngOnInit() {
    this.budgets = await this.ynabService.getBudgets();
    this.budget = this.budgets[0];
    const budgetId = this.budget.id;
    // this.months = await this.ynabService.getMonths(budgetId);
    this.currentMonth = await this.ynabService.getMonth(budgetId, 'current');
    this.accounts = await this.ynabService.getAccounts(budgetId);
    this.netWorth = this.getNetWorth(this.accounts);
    this.monthlyExpenses = this.getMonthlyExpenses(this.currentMonth);
    this.annualExpenses = this.monthlyExpenses * 12;

    this.updateInput();
  }

  updateInput() {
    const result = new CalculateInput();
    result.annualExpenses = this.annualExpenses;
    result.netWorth = this.netWorth;
    result.monthlyContribution = 3000;
    result.roundAll();
    this.calculateInputChange.emit(result);
  }

  getMonthlyExpenses(month: ynab.MonthDetail) {
    const expenses = month.categories.map(category => {
      return category.hidden ? 0 : category.budgeted;
    }).reduce((prev, next) => {
      return prev + next;
    });
    return ynab.utils.convertMilliUnitsToCurrencyAmount(expenses);
  }

  getNetWorth(allAccounts: ynab.Account[]) {
    if (!allAccounts || !allAccounts.length) {
      return 0;
    }

    const networth = allAccounts.map(account => {
      return account.closed ? 0 : account.cleared_balance;
    }).reduce((prev, next) => {
      return prev + next;
    });
    return ynab.utils.convertMilliUnitsToCurrencyAmount(networth);
  }

}
