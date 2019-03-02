import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute} from '@angular/router';
import { NgbPanelChangeEvent} from '@ng-bootstrap/ng-bootstrap';
import { timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import * as ynab from 'ynab';

import { YnabApiService } from '../../../ynab-api/ynab-api.service';
import { CalculateInput } from '../../models/calculate-input.model';
import { round } from '../../utilities/number-utility';

@Component({
  selector: 'app-ynab',
  templateUrl: 'ynab.component.html',
  styleUrls: ['./ynab.component.css']
})

export class YnabComponent implements OnInit {
  @Output() calculateInputChange = new EventEmitter<CalculateInput>();

  budgetForm: FormGroup;
  displayContributionInfo = true;
  public safeWithdrawalRatePercentage = 4.00;
  public expectedAnnualGrowthRate = 7.00;

  public budgets: ynab.BudgetSummary[];
  public budget: ynab.BudgetSummary;
  public months;
  public currentMonth: ynab.MonthDetail;
  public accounts: ynab.Account[];
  public categoryGroupsWithCategories: ynab.CategoryGroupWithCategories[];

  public netWorth: number;
  public categoriesDisplay: any;
  public monthlyExpenses: number;
  public leanMonthlyExpenses: number;
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
  public contributionCategories: any;
  public isUsingSampleData = false;

  public accordionPanelActiveStates: any = {};

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

  constructor(private ynabService: YnabApiService, private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute) {
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
      selectedBudget: ['', [Validators.required]],
      netWorth: [0, [Validators.required]],
      monthlyContribution: [0, [Validators.required]],
      categoryGroups: this.formBuilder.array([]),
      safeWithdrawalRatePercentage: [this.safeWithdrawalRatePercentage,
        [Validators.required, Validators.max(99.99), Validators.max(0.01) ]],
      expectedAnnualGrowthRate: [this.expectedAnnualGrowthRate,
        [Validators.required, Validators.max(99.99), Validators.max(0.01) ]],
    });
  }

  get categoryGroups(): FormArray {
    return this.budgetForm.get('categoryGroups') as FormArray;
  }

  async ngOnInit() {
    this.isUsingSampleData = this.ynabService.isUsingSampleData();

    const formChanges = this.budgetForm.valueChanges.pipe(debounce(() => timer(500)));
    formChanges.subscribe(() => {
      this.updateInput();
    });

    this.budgets = await this.ynabService.getBudgets();

    const budgetId = await this.setInitialSelectedBudget();
    await this.selectBudget(budgetId);
  }

  async setInitialSelectedBudget() {
    let selectedBudget = 'last-used';

    const storageBudget = window.localStorage.getItem('br4-selected-budget');
    if (storageBudget && this.budgets.some(b => b.id === storageBudget)) {
      selectedBudget = storageBudget;
    }

    const queryBudget = this.activatedRoute.snapshot.queryParams['budgetId'];
    if (queryBudget && this.budgets.some(b => b.id === queryBudget)) {
      selectedBudget = queryBudget;
    }

    return selectedBudget;
  }

  async selectBudget(budgetId: string) {
    this.budget = await this.ynabService.getBudgetById(budgetId);

    window.localStorage.setItem('br4-selected-budget', this.budget.id);

    this.months = await this.ynabService.getMonths(budgetId);
    const month = this.activatedRoute.snapshot.queryParams['month'] || 'current';

    this.currentMonth = await this.ynabService.getMonth(budgetId, month);
    this.accounts = await this.ynabService.getAccounts(budgetId);

    this.categoryGroupsWithCategories = await this.ynabService.getCategoryGroupsWithCategories(budgetId);
    const netWorth = this.getNetWorth(this.accounts);

    const mappedCategoryGroups = this.mapCategoryGroups(this.categoryGroupsWithCategories, this.currentMonth);
    const monthlyContribution = this.getMonthlyContribution(mappedCategoryGroups);
    this.contributionCategories = monthlyContribution.categories;

    this.resetForm(netWorth, mappedCategoryGroups, monthlyContribution.value);

    this.updateInput();
  }

  updateInput() {
    const selectedBudget = this.budgetForm.value.selectedBudget;
    if (this.budget.id !== selectedBudget) {
      this.selectBudget(selectedBudget);
      return;
    }
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

    const safeWithdrawalRatePercentage = Number.parseFloat(this.budgetForm.value.safeWithdrawalRatePercentage);
    if (!Number.isNaN(safeWithdrawalRatePercentage)) {
      result.annualSafeWithdrawalRate = Math.max(0, safeWithdrawalRatePercentage / 100);
    }
    const expectedAnnualGrowthRate = Number.parseFloat(this.budgetForm.value.expectedAnnualGrowthRate);
    if (!Number.isNaN(expectedAnnualGrowthRate)) {
      result.expectedAnnualGrowthRate = Math.max(0, expectedAnnualGrowthRate / 100);
    }

    result.roundAll();
    this.calculateInputChange.emit(result);
  }

  beforePanelChange($event: NgbPanelChangeEvent) {
    this.accordionPanelActiveStates[$event.panelId] = $event.nextState;
  }

  private getMonthlyExpenses(categoryGroups, budgetPropertyName) {
    const expenses = categoryGroups.map(categoryGroup => {
      if (!categoryGroup.categories || !categoryGroup.categories.length) {
        return 0;
      }
      return categoryGroup.categories.map(category => {
        return category[budgetPropertyName];
      }).reduce((prev, next) => {
        return prev + next;
      }, 0);
    }).reduce((prev, next) => {
      return prev + next;
    }, 0);

    return round(expenses);
  }

  private getNetWorth(allAccounts: ynab.Account[]) {
    if (!allAccounts || !allAccounts.length) {
      return 0;
    }

    const netWorth = allAccounts.map(account => {
      return account.closed ? 0 : account.balance;
    }).reduce((prev, next) => {
      return prev + next;
    }, 0);
    return ynab.utils.convertMilliUnitsToCurrencyAmount(netWorth);
  }

  private mapCategoryGroups(categoryGroupsWithCategories: ynab.CategoryGroupWithCategories[], monthDetail: ynab.MonthDetail) {
    if (!categoryGroupsWithCategories || !monthDetail) {
      return [];
    }
    const categoryGroups = categoryGroupsWithCategories.map(c => {
      const categoryGroupIgnore = c.hidden || this.ignoredCategoryGroups.includes(c.name.toLowerCase());
      const leanFiIgnore = categoryGroupIgnore || this.leanFiIgnoredCategoryGroups.includes(c.name.toLowerCase());
      const isContribution = this.contributionCategoryGroups.includes(c.name.toLowerCase());
      const mappedCategories = c.categories.map(ca => this.mapCategory(ca, monthDetail, categoryGroupIgnore, leanFiIgnore, isContribution));
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

    return categoryGroups.filter(c => !c.hidden);
  }

  private mapCategory(category: ynab.Category, monthDetail: ynab.MonthDetail,
    childrenIgnore: boolean, leanFiIgnore: boolean, isContribution: boolean) {
    let ignore = childrenIgnore || category.hidden;
    const found = monthDetail.categories.find(c => category.id === c.id);
    const retrievedBudgeted = !found ? 0 : ynab.utils.convertMilliUnitsToCurrencyAmount(found.budgeted);

    if (retrievedBudgeted < 0) {
      // Do not know how to handle negative contributions or budgeting
      // This typically happens if you're moving money around in your budget for the month
      // Default it to 0 but allow overrides
      ignore = true;
    }

    const overrides = this.getNoteOverrides(found.note);

    let computedFiBudget = ignore ? 0 : retrievedBudgeted;
    if (overrides.computedFiBudget !== undefined) {
      computedFiBudget = overrides.computedFiBudget;
    }

    let computedLeanFiBudget = leanFiIgnore ? 0 : computedFiBudget;
    if (overrides.computedLeanFiBudget !== undefined) {
      computedLeanFiBudget = overrides.computedLeanFiBudget;
    }

    let contributionBudget = isContribution ? retrievedBudgeted : 0;
    if (overrides.contributionBudget !== undefined) {
      contributionBudget = overrides.contributionBudget;
    }

    return Object.assign({
      name: category.name,
      ignore,
      hidden: category.hidden,
      id: category.id,
      retrievedBudgeted,
      computedFiBudget,
      computedLeanFiBudget,
      contributionBudget
    }, );
  }

  private getNoteOverrides(note: string) {
    const override = {
      contributionBudget: undefined,
      computedLeanFiBudget: undefined,
      computedFiBudget: undefined
    };

    if (!note) {
      return override;
    }

    const commands = this.getCommands(note);

    commands.forEach(c => {
      switch (c.key) {
        case '+':
        case 'c':
        case 'contribution':
          override.contributionBudget = c.value;
          break;
        case 'l':
        case 'lfi':
        case 'lean':
          override.computedLeanFiBudget = c.value;
          break;
        case 'f':
        case 'fi':
          override.computedFiBudget = c.value;
          break;
        default:
          break;
      }
    });

    return override;
  }

  private getCommands(originalNote: string) {
    const note = originalNote.toLowerCase();
    const commandPrefix = 'br4';
    if (note.indexOf(commandPrefix) === -1) {
      return [];
    }

    const lines = note.split(commandPrefix);
    if (!lines || !lines.length) {
      return [];
    }

    return lines.map(line => {
      const cleaned = line.replace(/\:/g, ' ').replace(/\s+/g, ' ').trim();
      const numRegex = /[+-]?\d+(?:\.\d+)?/g;
      const match = numRegex.exec(cleaned);
      if (!match || !match.length) {
        return {};
      }
      const foundValue = match[0];
      const key = cleaned.substr(0, cleaned.indexOf(foundValue)).trim();
      const value = Number(foundValue);
      return {
        key,
        value
      };
    }).filter(l => l.key);
  }

  private getMonthlyContribution(categoryGroups) {
    let contribution = 0;
    const categories = [];

    if (categoryGroups) {
      categoryGroups.forEach(cg => {
        cg.categories.forEach(c => {
          if (c.contributionBudget) {
            contribution += c.contributionBudget;
            categories.push({
              name: c.name,
              value: c.contributionBudget
            });
          }
        });
      });
    }

    return {
      value: round(contribution),
      categories
    };
  }

  private resetForm(netWorth, categoriesDisplay, monthlyContribution) {
    this.budgetForm.reset({
      selectedBudget: this.budget.id,
      netWorth,
      monthlyContribution,
      expectedAnnualGrowthRate: this.expectedAnnualGrowthRate,
      safeWithdrawalRatePercentage: this.safeWithdrawalRatePercentage
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
