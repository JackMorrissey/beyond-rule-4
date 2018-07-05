import { Injectable } from '@angular/core';


import * as ynab from 'ynab';
import { environment } from '../../environments/environment';

import { SampleData } from './sample-data.secret';


@Injectable()
export class YnabApiService {
  private ynabApi: ynab.api;

  private useSampleData = true;

  constructor() {
    this.setApiAccess();
  }

  authorize() {
    const uri =
    // tslint:disable-next-line:max-line-length
    `https://app.youneedabudget.com/oauth/authorize?client_id=${environment.clientId}&redirect_uri=${environment.redirectUri}&response_type=token`;
    location.replace(uri);
  }

  getToken() {
    return sessionStorage.getItem('ynab_access_token');
  }

  clearToken() {
    sessionStorage.removeItem('ynab_access_token');
    this.useSampleData = true;
  }

  isAuthorized() {
    return !!this.getToken();
  }

  setApiAccess() {
    const token = this.getToken();
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
      sessionStorage.setItem('ynab_access_token', token);
      window.location.hash = '';
    }
    this.setApiAccess();
    return !this.useSampleData;
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

  async getMonth(budgetId: string, budgetMonth: Date | 'current'): Promise<ynab.MonthDetail> {
    if (this.useSampleData) {
      return SampleData.Month;
    }

    const month = await this.ynabApi.months.getBudgetMonth(budgetId, budgetMonth);
    return month.data.month;
  }

  async getAccounts(budgetId: string): Promise<ynab.Account[]> {
    if (this.useSampleData) {
      return SampleData.Accounts;
    }

    const accounts = await this.ynabApi.accounts.getAccounts(budgetId);
    return accounts.data.accounts;
  }

  async getCategoryGroupsWithCategories(budgetId: string): Promise<ynab.CategoryGroupWithCategories[]> {
    if (this.useSampleData) {
      return SampleData.CategoryGroupsWithCategories;
    }

    const categories = await this.ynabApi.categories.getCategories(budgetId);
    return categories.data.category_groups;
  }
}
