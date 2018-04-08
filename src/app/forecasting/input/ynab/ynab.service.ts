import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as ynab from 'ynab';

import { devAccessToken } from './token.secret';
import { SampleData } from './sample-data.secret';
import { BudgetSummary, MonthSummary } from 'ynab';


@Injectable()
export class YnabService {
  private ynabApi: ynab.api;

  private useSampleData = true;

  constructor(private http: Http) {
    this.ynabApi = new ynab.api(devAccessToken);
  }

  async getBudgets(): Promise<ynab.BudgetSummary[]> {
    if (this.useSampleData) {
      return SampleData.Budgets;
    }

    const budgets = await this.ynabApi.budgets.getBudgets();
    return budgets.data.budgets;
  }

  async getMonths(budgetId: string): Promise<ynab.MonthSummary[]> {
    if (this.useSampleData) {
      return SampleData.Months;
    }

    const months = await this.ynabApi.months.getBudgetMonths(budgetId);
    return months.data.months;
  }

  async getAccounts(budgetId: string): Promise<ynab.Account[]> {
    if (this.useSampleData) {
      return SampleData.Accounts;
    }

    const accounts = await this.ynabApi.accounts.getAccounts(budgetId);
    return accounts.data.accounts;
  }
}
