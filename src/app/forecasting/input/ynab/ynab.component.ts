import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { NgbPanelChangeEvent} from '@ng-bootstrap/ng-bootstrap';
import { timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import * as ynab from 'ynab';

import { YnabApiService } from '../../../ynab-api/ynab-api.service';
import { CalculateInput } from '../../models/calculate-input.model';
import { round } from '../../utilities/number-utility';
import { CategoryBudgetInfo } from './category-budget-info';

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
  public birthdate: Date;

  public budgets: ynab.BudgetSummary[];
  public budget: ynab.BudgetDetail;
  public months: ynab.MonthDetail[];
  public currentMonth: ynab.MonthDetail;
  public selectedMonthA: ynab.MonthDetail;
  public selectedMonthB: ynab.MonthDetail;
  public categoryGroupsWithCategories: ynab.CategoryGroupWithCategories[];

  public ynabNetWorth: number;
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
      selectedMonthA: ['', [Validators.required]],
      selectedMonthB: ['', [Validators.required]],
      monthlyContribution: [0, [Validators.required]],
      categoryGroups: this.formBuilder.array([]),
      accounts: this.formBuilder.array([]),
      safeWithdrawalRatePercentage: [this.safeWithdrawalRatePercentage,
        [Validators.required, Validators.max(99.99), Validators.max(0.01) ]],
      expectedAnnualGrowthRate: [this.expectedAnnualGrowthRate,
        [Validators.required, Validators.max(99.99), Validators.max(0.01) ]],
      birthdate: [this.birthdate,
        [Validators.max(150), Validators.min(0) ]]
    });
  }

  get categoryGroups(): FormArray {
    return this.budgetForm.get('categoryGroups') as FormArray;
  }

  get accounts(): FormArray {
    return this.budgetForm.get('accounts') as FormArray;
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

  private setInitialSelectedBudget(): string {
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

    this.months = this.budget.months;
    this.currentMonth = await this.ynabService.getMonth(budgetId, 'current');
    this.categoryGroupsWithCategories = await this.ynabService.getCategoryGroupsWithCategories(this.budget.id);

    await this.selectMonths(this.currentMonth.month, this.currentMonth.month);
  }

  async selectMonths(monthA: string, monthB: string) {
    const months = this.setMonths(monthA, monthB);

    const mappedAccounts = this.mapAccounts(this.budget.accounts);

    const mappedCategoryGroups = this.mapCategoryGroups(this.categoryGroupsWithCategories, months);
    const monthlyContribution = this.getMonthlyContribution(mappedCategoryGroups);
    this.contributionCategories = monthlyContribution.categories;

    this.resetForm(mappedCategoryGroups, monthlyContribution.value, mappedAccounts);

    this.updateInput();
  }

  private setMonths(monthA: string, monthB: string): ynab.MonthDetail[] {
    const result = new Array<ynab.MonthDetail>();
    let inRange = false;
    for (let i = 0; i < this.months.length; i++) {
      const month = this.months[i];
      if (month.month === monthA || month.month === monthB) {
        if (inRange) {
          this.selectedMonthA = month;
          result.push(month);
          break;
        }

        this.selectedMonthB = month;
        if (monthA === monthB) {
          this.selectedMonthA = month;
          result.push(month);
          break;
        }
        inRange = true;
      }
      if (inRange) {
        result.push(month);
      }
    }
    return result;
  }

  updateInput() {
    const selectedBudget = this.budgetForm.value.selectedBudget;
    if (this.budget.id !== selectedBudget) {
      this.selectBudget(selectedBudget);
      return;
    }

    if (this.selectedMonthA.month !== this.budgetForm.value.selectedMonthA ||
        this.selectedMonthB.month !== this.budgetForm.value.selectedMonthB) {
      this.selectMonths(this.budgetForm.value.selectedMonthA, this.budgetForm.value.selectedMonthB);
      return;
    }

    const fiMonthlyExpenses = this.getMonthlyExpenses(this.budgetForm.value.categoryGroups, 'fiBudget');
    const leanMonthlyExpenses = this.getMonthlyExpenses(this.budgetForm.value.categoryGroups, 'leanFiBudget');
    const retrievedBudgetedMonthlyExpenses = this.getMonthlyExpenses(this.budgetForm.value.categoryGroups, 'retrievedBudgeted');

    this.setNetWorth();

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
    result.netWorth = this.netWorth;
    result.monthlyContribution = this.budgetForm.value.monthlyContribution;

    const safeWithdrawalRatePercentage = Number.parseFloat(this.budgetForm.value.safeWithdrawalRatePercentage);
    if (!Number.isNaN(safeWithdrawalRatePercentage)) {
      this.safeWithdrawalRatePercentage = safeWithdrawalRatePercentage;
      result.annualSafeWithdrawalRate = Math.max(0, safeWithdrawalRatePercentage / 100);
    }
    const expectedAnnualGrowthRate = Number.parseFloat(this.budgetForm.value.expectedAnnualGrowthRate);
    if (!Number.isNaN(expectedAnnualGrowthRate)) {
      this.expectedAnnualGrowthRate = expectedAnnualGrowthRate;
      result.expectedAnnualGrowthRate = Math.max(0, expectedAnnualGrowthRate / 100);
    }

    if (this.budgetForm.value.birthdate) {
      this.birthdate = new Date(this.budgetForm.value.birthdate);
      result.birthdate = this.birthdate;
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

  private setNetWorth() {
    let ynabNetWorth = 0;
    let netWorth = 0;
    this.accounts.controls.forEach(a => {
      const ynabBalance = Number.parseFloat(a.value.ynabBalance);
      if (!Number.isNaN(ynabBalance)) {
        ynabNetWorth += ynabBalance;
      }
      const balance = Number.parseFloat(a.value.balance);
      if (!Number.isNaN(balance)) {
        netWorth += balance;
      }
    });

    this.ynabNetWorth = ynabNetWorth;
    this.netWorth = netWorth;
  }

  private mapCategoryGroups(categoryGroupsWithCategories: ynab.CategoryGroupWithCategories[], monthDetails: ynab.MonthDetail[]) {
    if (!categoryGroupsWithCategories || !monthDetails) {
      return [];
    }
    const categoryGroups = categoryGroupsWithCategories.map(c => {
      const categoryGroupIgnore = c.hidden || this.ignoredCategoryGroups.includes(c.name.toLowerCase());
      const leanFiIgnore = categoryGroupIgnore || this.leanFiIgnoredCategoryGroups.includes(c.name.toLowerCase());
      const isContribution = this.contributionCategoryGroups.includes(c.name.toLowerCase());
      const mappedCategories =
        c.categories.map(ca => this.mapCategory(ca, monthDetails, categoryGroupIgnore, leanFiIgnore, isContribution));
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

  private mapCategory(category: ynab.Category, monthDetails: ynab.MonthDetail[],
    childrenIgnore: boolean, leanFiIgnore: boolean, isContribution: boolean) {
    let ignore = childrenIgnore || category.hidden;
    const categoryBudgetInfo = new CategoryBudgetInfo(category, monthDetails);
    const retrievedBudgeted = categoryBudgetInfo.mean;

    if (retrievedBudgeted < 0) {
      // Do not know how to handle negative contributions or budgeting
      // This typically happens if you're moving money around in your budget for the month
      // Default it to 0 but allow overrides
      ignore = true;
    }

    const overrides = this.getNoteOverrides(categoryBudgetInfo.categoryNote, retrievedBudgeted);

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
      contributionBudget,
      info: categoryBudgetInfo
    }, );
  }

  private mapAccounts(accounts: ynab.Account[]) {
    const mapped = accounts.filter(a => !(a.closed || a.deleted))
    .map(a => this.formBuilder.group(Object.assign({}, a, {
      balance: this.getAccountBalance(a),
      ynabBalance: ynab.utils.convertMilliUnitsToCurrencyAmount(a.balance)
    })));
    return mapped;
  }

  private getAccountBalance(account: ynab.Account) {
    const balance = ynab.utils.convertMilliUnitsToCurrencyAmount(account.balance);
    const overrides = this.getNoteOverrides(account.note, balance);

    if (overrides.contributionBudget !== undefined) {
      return overrides.contributionBudget;
    }

    if (account.type === ynab.Account.TypeEnum.InvestmentAccount || account.type === ynab.Account.TypeEnum.OtherAsset) {
      return balance;
    }

    return 0;
  }

  private getNoteOverrides(note: string, originalValue: number) {
    const override = {
      contributionBudget: undefined,
      computedLeanFiBudget: undefined,
      computedFiBudget: undefined
    };

    if (!note) {
      return override;
    }

    const commands = this.getCommands(note, originalValue);

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

  private getCommands(originalNote: string, originValue: number) {
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
        return {
          key: cleaned,
          value: originValue
        };
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
              value: c.contributionBudget,
              info: c.info
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

  private resetForm(categoriesDisplay, monthlyContribution, mappedAccounts) {
    this.budgetForm.reset({
      selectedBudget: this.budget.id,
      selectedMonthA: this.selectedMonthA.month,
      selectedMonthB: this.selectedMonthB.month,
      monthlyContribution,
      expectedAnnualGrowthRate: this.expectedAnnualGrowthRate,
      safeWithdrawalRatePercentage: this.safeWithdrawalRatePercentage,
      birthdate: this.birthdate
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
        info: c.info,
        ignore: c.ignore
      })))
    }));

    this.budgetForm.setControl('categoryGroups', this.formBuilder.array(categoryGroupFormGroups));
    this.budgetForm.setControl('accounts', this.formBuilder.array(mappedAccounts));
  }

}
