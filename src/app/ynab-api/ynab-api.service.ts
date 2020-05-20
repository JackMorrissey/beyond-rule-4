import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cookie } from 'ng2-cookies';


import * as ynab from 'ynab';
import { environment } from '../../environments/environment';

import { SampleData } from './sample-data.values';

const tokenName = 'ynab_access_token';

@Injectable()
export class YnabApiService {
  private ynabApi: ynab.api;

  private useSampleData = true;

  public isAuthorized$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {
    this.setApiAccess();
  }

  authorize() {
    const uri =
    // tslint:disable-next-line:max-line-length
    `https://app.youneedabudget.com/oauth/authorize?client_id=${environment.clientId}&redirect_uri=${environment.redirectUri}&response_type=token&scope=read-only`;
    location.replace(uri);
  }

  getToken() {
    return Cookie.get(tokenName);

  }

  clearToken() {
    Cookie.delete(tokenName);
    this.useSampleData = true;
    this.isAuthorized$.next(false);
  }

  isAuthorized() {
    return !!this.getToken();
  }

  setApiAccess() {
    const token = this.getToken();
    this.isAuthorized$.next(!!token);
    if (token) {
      this.useSampleData = false;
      this.ynabApi = new ynab.api(token);
    } else {
      this.useSampleData = true;
    }
  }

  // thanks Ynab Starter!
  findYnabToken(): boolean {
    let token = null;
    const search = window.location.hash.substring(1).replace(/&/g, '","').replace(/=/g, '":"');
    if (search && search !== '') {
      // Try to get access_token from the hash returned by OAuth
      const params = JSON.parse('{"' + search + '"}', function(key, value) {
        return key === '' ? value : decodeURIComponent(value);
      });
      token = params.access_token;
      Cookie.set(tokenName, token, 0.08); // 2 hrs (7200) comes back
      window.location.hash = '';
    }
    this.setApiAccess();
    return !this.useSampleData;
  }

  isUsingSampleData(): boolean {
    return this.useSampleData;
  }

  async getBudgets(): Promise<ynab.BudgetSummary[]> {
    if (this.useSampleData) {
      return SampleData.Budgets;
    }

    try {
      const budgets = await this.ynabApi.budgets.getBudgets();
    return budgets.data.budgets;
    } catch (error) {
      console.error(error);
    }
  }

  async getBudgetById(budgetId: string): Promise<ynab.BudgetDetail> {
    if (this.useSampleData) {
      return SampleData.Budget;
    }

    try {
      const budget = await this.ynabApi.budgets.getBudgetById(budgetId);
    return budget.data.budget;
    } catch (error) {
      console.error(error);
    }
  }

  async getMonth(budgetId: string, budgetMonth: Date | 'current'): Promise<ynab.MonthDetail> {
    if (this.useSampleData) {
      return SampleData.Month;
    }

    try {
      const month = await this.ynabApi.months.getBudgetMonth(budgetId, budgetMonth);
      return month.data.month;
    } catch (error) {
      console.error(error);
    }
  }

  async getCategoryGroupsWithCategories(budgetId: string): Promise<ynab.CategoryGroupWithCategories[]> {
    if (this.useSampleData) {
      return SampleData.CategoryGroupsWithCategories;
    }

    try {
      const categories = await this.ynabApi.categories.getCategories(budgetId);
      return categories.data.category_groups;
    } catch (error) {
      console.error(error);
    }
  }
}
