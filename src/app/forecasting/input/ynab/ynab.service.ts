import { Injectable } from '@angular/core';


import * as ynab from 'ynab';

import { devAccessToken } from './token.secret';
import { SampleData } from './sample-data.secret';


@Injectable()
export class YnabService {
  private ynabApi: ynab.api;

  private useSampleData = false;

  constructor() {
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
