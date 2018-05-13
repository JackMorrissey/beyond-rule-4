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
  public categoryGroupsWithCategories: ynab.CategoryGroupWithCategories[];

  public netWorth: number;
  public monthlyExpenses: number;
  public annualExpenses: number;
  public categoriesDisplay: any;

  private ignoredMasterCategories = [
    'Credit Card Payments',
    'Internal Master Category',
    'Financial Independence',
  ];

  constructor(private ynabService: YnabService) { }

  async ngOnInit() {
    this.budgets = await this.ynabService.getBudgets();
    this.budget = this.budgets[0];
    const budgetId = this.budget.id;
    // this.months = await this.ynabService.getMonths(budgetId);
    this.currentMonth = await this.ynabService.getMonth(budgetId, 'current');
    this.accounts = await this.ynabService.getAccounts(budgetId);

    this.categoryGroupsWithCategories = await this.ynabService.getCategoryGroupsWithCategories(budgetId);

    this.netWorth = this.getNetWorth(this.accounts);
    this.categoriesDisplay = this.getCategoriesDisplay(this.categoryGroupsWithCategories, this.currentMonth);

    this.updateInput();
  }

  updateInput() {
    this.monthlyExpenses = this.getMonthlyExpenses(this.categoriesDisplay);
    this.annualExpenses = this.monthlyExpenses * 12;
    const result = new CalculateInput();
    result.annualExpenses = this.annualExpenses;
    result.netWorth = this.netWorth;
    result.monthlyContribution = 3000;
    result.roundAll();
    this.calculateInputChange.emit(result);
  }

  private getMonthlyExpenses(categoriesDisplay) {
    const expenses = categoriesDisplay.map(categoryGroup => {
      return categoryGroup.categories.map(category => {
        console.log(category);
        return category.budgeted;
      }).reduce((prev, next) => {
        return prev + next;
      });
    }).reduce((prev, next) => {
      return prev + next;
    });

    return ynab.utils.convertMilliUnitsToCurrencyAmount(expenses);
  }

  private getNetWorth(allAccounts: ynab.Account[]) {
    if (!allAccounts || !allAccounts.length) {
      return 0;
    }

    const netWorth = allAccounts.map(account => {
      return account.closed ? 0 : account.cleared_balance;
    }).reduce((prev, next) => {
      return prev + next;
    });
    return ynab.utils.convertMilliUnitsToCurrencyAmount(netWorth);
  }

  private getCategoriesDisplay(categoryGroupsWithCategories: ynab.CategoryGroupWithCategories[], monthDetail: ynab.MonthDetail) {
    if (!categoryGroupsWithCategories) {
      return [];
    }
    const categories = categoryGroupsWithCategories.map(c => {
      const childrenIgnore = c.hidden || this.ignoredMasterCategories.includes(c.name);
      return {
        name: c.name,
        hidden: c.hidden,
        id: c.id,
        categories: c.categories.map(ca => this.mapCategory(ca, childrenIgnore, monthDetail))
      };
    });
    return categories;
  }

  private mapCategory(category: ynab.Category, childrenIgnore: boolean, monthDetail: ynab.MonthDetail) {
    const ignore = childrenIgnore || category.hidden;
    const found = monthDetail.categories.find(c => category.id === c.id);
    const retrievedBudgeted = !found ? 0 : found.budgeted;
    const budgeted = ignore ? 0 : retrievedBudgeted;

    return {
      name: category.name,
      ignore,
      hidden: category.hidden,
      id: category.id,
      budgeted,
      retrievedBudgeted,
    };
  }

}
