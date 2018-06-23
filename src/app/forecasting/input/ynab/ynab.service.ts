import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as ynab from 'ynab';

// import { devAccessToken } from './token.secret';
// import { SampleData } from './sample-data.secret';


@Injectable()
export class YnabService {
  private ynabApi: ynab.api;

  private useSampleData = false;

  constructor(private http: Http) {
  }

  async getBudgets(): Promise<ynab.BudgetSummary[]> {


    const budgets = await this.ynabApi.budgets.getBudgets();
    return budgets.data.budgets;
  }

  async getMonths(budgetId: string): Promise<ynab.MonthSummary[]> {


    const months = await this.ynabApi.months.getBudgetMonths(budgetId);
    return months.data.months;
  }

  async getMonth(budgetId: string, budgetMonth: Date | 'current'): Promise<ynab.MonthDetail> {


    const month = await this.ynabApi.months.getBudgetMonth(budgetId, budgetMonth);
    return month.data.month;
  }

  async getAccounts(budgetId: string): Promise<ynab.Account[]> {


    const accounts = await this.ynabApi.accounts.getAccounts(budgetId);
    return accounts.data.accounts;
  }

  async getCategoryGroupsWithCategories(budgetId: string): Promise<ynab.CategoryGroupWithCategories[]> {


    const categories = await this.ynabApi.categories.getCategories(budgetId);
    return categories.data.category_groups;
  }
}
