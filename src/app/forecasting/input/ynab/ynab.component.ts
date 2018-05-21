import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormControl, FormBuilder, Validators } from '@angular/forms';
import { timer } from 'rxjs/observable/timer';
import { debounce } from 'rxjs/operators';
import * as ynab from 'ynab';

import { YnabService } from './ynab.service';
import { CalculateInput } from '../../models/calculate-input.model';
import { round } from '../../utilities/number-utility';

@Component({
  selector: 'app-ynab',
  templateUrl: 'ynab.component.html'
})

export class YnabComponent implements OnInit {
  @Output() calculateInputChange = new EventEmitter<CalculateInput>();

  budgetForm: FormGroup;

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

  private hiddenMasterCategories = [
    'Credit Card Payments',
    'Internal Master Category',
  ];
  private ignoredMasterCategories = [
    'Financial Independence',
    ...this.hiddenMasterCategories,
  ];

  constructor(private ynabService: YnabService, private formBuilder: FormBuilder) {
    this.budgetForm = this.formBuilder.group({
      categoryGroups: this.formBuilder.array([])
    });
  }

  get categoryGroups(): FormArray {
    return this.budgetForm.get('categoryGroups') as FormArray;
  }

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
    this.resetForm(this.categoriesDisplay);

    const formChanges = this.budgetForm.valueChanges.pipe(debounce(() => timer(500)));
    formChanges.subscribe(() => {
      console.log(JSON.stringify(this.budgetForm.value.categoryGroups));
      this.updateInput();
    });

    this.updateInput();
  }

  updateInput() {
    // this.monthlyExpenses = this.getMonthlyExpenses(this.categoriesDisplay);
    this.monthlyExpenses = this.getMonthlyExpenses(this.budgetForm.value.categoryGroups);
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
        return category.budgeted;
      }).reduce((prev, next) => {
        return prev + next;
      });
    }).reduce((prev, next) => {
      return prev + next;
    });

    return round(expenses);
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
    const categoryGroups = categoryGroupsWithCategories.map(c => {
      const childrenIgnore = c.hidden || this.ignoredMasterCategories.includes(c.name);
      const mappedCategories = c.categories.map(ca => this.mapCategory(ca, childrenIgnore, monthDetail));
      const hidden = c.hidden || this.hiddenMasterCategories.includes(c.name) || mappedCategories.every(mc => mc.hidden);
      return {
        name: c.name,
        id: c.id,
        hidden,
        categories: mappedCategories
      };
    });
    categoryGroups.sort((a, b) => {
      if (a.hidden === b.hidden) { return -1; }
      if (a.hidden) { return 1; }
      if (b.hidden) { return -1; }
      return 0;
    });

    return categoryGroups;
  }

  private resetForm(categoriesDisplay) {
    const categoryGroupFormGroups = categoriesDisplay.map(cg => this.formBuilder.group({
      name: cg.name,
      id: cg.id,
      hidden: cg.id,
      categories: this.formBuilder.array(cg.categories.map(c => this.formBuilder.group({
        name: c.name,
        budgeted: c.budgeted,
        retrievedBudgeted: c.retrievedBudgeted,
        ignore: c.ignore
      })))
    }));
    const categoryGroups = this.formBuilder.array(categoryGroupFormGroups);
    this.budgetForm.setControl('categoryGroups', categoryGroups);
  }

  private mapCategory(category: ynab.Category, childrenIgnore: boolean, monthDetail: ynab.MonthDetail) {
    const ignore = childrenIgnore || category.hidden;
    const found = monthDetail.categories.find(c => category.id === c.id);
    const retrievedBudgeted = !found ? 0 : ynab.utils.convertMilliUnitsToCurrencyAmount(found.budgeted);
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
