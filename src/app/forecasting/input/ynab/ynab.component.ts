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
  public categoriesDisplay: any;
  public monthlyExpenses: number;
  public annualExpenses: number;
  public leanMonthlyExpenses: number;
  public leanAnnualExpenses: number;
  public expenses: {
    ynab: {
      monthly: number,
      annual: number
    },
    fi: {
      monthly: number,
      annual: number
    },
    leanFi: {
      monthly: number,
      annual: number
    }
  };

  private hiddenCategoryGroups = [
    'credit card payments',
    'internal master category',
  ];
  private contributionCategoryGroups = [
    'fi',
    'fire',
    'financial independence',
    'investments',
    'retirement'
  ];
  private ignoredCategoryGroups = [
    'debt payments',
    ...this.contributionCategoryGroups,
    ...this.hiddenCategoryGroups,
  ];
  private leanFiIgnoredCategoryGroups = [
    'just for fun',
    'quality of life goals',
    ...this.ignoredCategoryGroups
  ];

  constructor(private ynabService: YnabService, private formBuilder: FormBuilder) {
    this.expenses = {
      ynab: {
        monthly: 0,
        annual: 0
      },
      fi: {
        monthly: 0,
        annual: 0
      },
      leanFi: {
        monthly: 0,
        annual: 0
      }
    };
    this.budgetForm = this.formBuilder.group({
      netWorth: [0, [Validators.required]],
      monthlyContribution: [0, [Validators.required]],
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

    const netWorth = this.getNetWorth(this.accounts);
    const categoryGroups = this.mapCategoryGroups(this.categoryGroupsWithCategories, this.currentMonth);
    const parsedCommands = this.getParsedCommands(this.currentMonth);
    console.log(parsedCommands);
    const monthlyContribution = this.getMonthlyContribution(parsedCommands);
    this.resetForm(netWorth, categoryGroups, monthlyContribution);

    const formChanges = this.budgetForm.valueChanges.pipe(debounce(() => timer(500)));
    formChanges.subscribe(() => {
      // TODO: lets check what changed here
      this.updateInput();
    });

    this.updateInput();
  }

  updateInput() {
    const fiMonthlyExpenses = this.getMonthlyExpenses(this.budgetForm.value.categoryGroups, 'fiBudget');
    const leanMonthlyExpenses = this.getMonthlyExpenses(this.budgetForm.value.categoryGroups, 'leanFiBudget');
    const retrievedBudgetedMonthlyExpenses = this.getMonthlyExpenses(this.budgetForm.value.categoryGroups, 'retrievedBudgeted');

    this.expenses = {
      ynab: {
        monthly: retrievedBudgetedMonthlyExpenses,
        annual: retrievedBudgetedMonthlyExpenses * 12
      },
      fi: {
        monthly: fiMonthlyExpenses,
        annual: fiMonthlyExpenses * 12
      },
      leanFi: {
        monthly: leanMonthlyExpenses,
        annual: leanMonthlyExpenses * 12
      }
    };

    const result = new CalculateInput();
    result.annualExpenses = this.expenses.fi.annual;
    result.leanAnnualExpenses = this.expenses.leanFi.annual;
    result.netWorth = this.budgetForm.value.netWorth;
    result.monthlyContribution = this.budgetForm.value.monthlyContribution;
    result.roundAll();
    this.calculateInputChange.emit(result);
  }

  private getMonthlyExpenses(categoryGroups, budgetPropertyName) {
    const expenses = categoryGroups.map(categoryGroup => {
      return categoryGroup.categories.map(category => {
        return category[budgetPropertyName];
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

  private mapCategoryGroups(categoryGroupsWithCategories: ynab.CategoryGroupWithCategories[], monthDetail: ynab.MonthDetail) {
    if (!categoryGroupsWithCategories) {
      return [];
    }
    const categoryGroups = categoryGroupsWithCategories.map(c => {
      const categoryGroupIgnore = c.hidden || this.ignoredCategoryGroups.includes(c.name.toLowerCase());
      const leanFiIgnore = categoryGroupIgnore || this.leanFiIgnoredCategoryGroups.includes(c.name.toLowerCase());
      const mappedCategories = c.categories.map(ca => this.mapCategory(ca, monthDetail, categoryGroupIgnore, leanFiIgnore));
      const hidden = c.hidden || this.hiddenCategoryGroups.includes(c.name.toLowerCase()) || mappedCategories.every(mc => mc.hidden);
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

  private mapCategory(category: ynab.Category, monthDetail: ynab.MonthDetail, childrenIgnore: boolean, leanFiIgnore: boolean) {
    const ignore = childrenIgnore || category.hidden;
    const found = monthDetail.categories.find(c => category.id === c.id);
    const retrievedBudgeted = !found ? 0 : ynab.utils.convertMilliUnitsToCurrencyAmount(found.budgeted);
    const computedFiBudget = ignore ? 0 : retrievedBudgeted;
    const computedLeanFiBudget = leanFiIgnore ? 0 : computedFiBudget;

    return {
      name: category.name,
      ignore,
      hidden: category.hidden,
      id: category.id,
      retrievedBudgeted,
      computedFiBudget,
      computedLeanFiBudget,
    };
  }

  private getParsedCommands(monthDetail: ynab.MonthDetail) {
    const categoriesWithCommands = [];
    const commandPrefix = 'fi:';

    monthDetail.categories.forEach(c => {
      if (!c.note) {
        return;
      }
      const lines = c.note.toLowerCase().split('\n').map(l => l.trim());
      const commandLines = lines.filter((l) => {
        return l.startsWith(commandPrefix);
      }).map((l) => {
        return l.substr(commandPrefix.length);
      });
      if (commandLines.length) {
        categoriesWithCommands.push({
          category: c,
          commandLines
        });
      }
    });
    return categoriesWithCommands;
  }

  private getMonthlyContribution(parsedCommands): number {
    let contribution = 0;
    const monthlyPrefix = '+monthly:';
    const yearlyPrefix = '+yearly:';
    parsedCommands.forEach(categoryWithCommands => {
      const commandLines: string[] = categoryWithCommands.commandLines;
      const categoryName = categoryWithCommands.category.name;
      const monthlyContribution = commandLines.filter((c) => {
        return c.trim().startsWith(monthlyPrefix);
      }).map(l => {
        return Number(l.trim().substr(monthlyPrefix.length).trim());
      }).reduce((prev, next) => {
        if (!next) {
          return prev;
        }
        return prev + next;
      }, 0);
      const yearlyContribution = commandLines.filter((c) => {
        return c.trim().startsWith(yearlyPrefix);
      }).map(l => {
        return Number(l.trim().substr(yearlyPrefix.length).trim());
      }).reduce((prev, next) => {
        if (!next) {
          return prev;
        }
        return prev + next;
      }, 0);
      contribution += monthlyContribution + (yearlyContribution / 12);
    });

    return round(contribution);
  }

  private resetForm(netWorth, categoriesDisplay, monthlyContribution) {
    this.budgetForm.reset({
      netWorth,
      monthlyContribution,
    });

    const categoryGroupFormGroups = categoriesDisplay.map(cg => this.formBuilder.group({
      name: cg.name,
      id: cg.id,
      hidden: cg.id,
      categories: this.formBuilder.array(cg.categories.map(c => this.formBuilder.group({
        name: c.name,
        retrievedBudgeted: c.retrievedBudgeted,
        computedFiBudget: c.computedFiBudget,
        computedLeanFiBudget: c.computedLeanFiBudget,
        fiBudget: c.computedFiBudget,
        leanFiBudget: c.computedLeanFiBudget,
        ignore: c.ignore
      })))
    }));
    const categoryGroups = this.formBuilder.array(categoryGroupFormGroups);
    this.budgetForm.setControl('categoryGroups', categoryGroups);
  }

}
