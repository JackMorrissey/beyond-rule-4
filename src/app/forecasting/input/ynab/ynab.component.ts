import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import * as ynab from 'ynab';

import { YnabApiService } from '../../../ynab-api/ynab-api.service';
import { CalculateInput } from '../../models/calculate-input.model';
import { round } from '../../utilities/number-utility';
import CategoryUtility from './category-utility';
import NoteUtility from './note-utility';

@Component({
  selector: 'app-ynab',
  templateUrl: 'ynab.component.html',
  styleUrls: ['./ynab.component.css']
})

export class YnabComponent implements OnInit {
  @Output() calculateInputChange = new EventEmitter<CalculateInput>();

  budgetForm: FormGroup;
  displayContributionInfo = true;
  currencyIsoCode = 'USD';
  public safeWithdrawalRatePercentage = 4.00;
  public expectedAnnualGrowthRate = 7.00;

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
      [Validators.required, Validators.max(99.99), Validators.max(0.01)]],
      expectedAnnualGrowthRate: [this.expectedAnnualGrowthRate,
      [Validators.required, Validators.max(99.99), Validators.max(0.01)]],
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

    const budgetId = this.setInitialSelectedBudget();
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
    this.calculateInputChange.emit(undefined);
    this.budget = await this.ynabService.getBudgetById(budgetId);
    window.localStorage.setItem('br4-selected-budget', this.budget.id);

    this.months = this.budget.months;
    this.currentMonth = await this.ynabService.getMonth(budgetId, 'current');
    this.categoryGroupsWithCategories = await this.ynabService.getCategoryGroupsWithCategories(this.budget.id);
    this.currencyIsoCode = this.budget.currency_format ? this.budget.currency_format.iso_code : 'USD';

    await this.selectMonths(this.currentMonth.month, this.currentMonth.month);
  }

  async selectMonths(monthA: string, monthB: string) {
    const months = this.setMonths(monthA, monthB);

    const mappedAccounts = this.mapAccounts(this.budget.accounts);

    const mappedCategoryGroups = CategoryUtility.mapCategoryGroups(this.categoryGroupsWithCategories, months);
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
  
  /* Chooses months based on common decisions. Options: All, Last calendar year, Last 12 months, Year to date, Current month. */
  async quickChooseMonths(choice: string) { 
    // Get some etc facts that are shared by some of the buttons below.
    const budgetId = window.localStorage.getItem('br4-selected-budget');
    const currentMonth = await this.ynabService.getMonth(budgetId, 'current');
    let currentMonthIdx = 0;
    for (let i = 0; i < this.months.length; i++) {
      const month = this.months[i];
      if (currentMonth.month === month.month) {
        currentMonthIdx = i;
      }
    }
    
    switch (choice) {
      case 'all':
        await this.selectMonths(this.months[this.months.length - 1].month, this.months[0].month);  
        break;
      case 'yr':
        // Go to current month, work backwards to prev Dec, then calc from there. 
        for (let i = currentMonthIdx + 1; i < this.months.length; i++) { //Note: Adding 1 to current month, in case this is december. We would want last year's december
          const month = this.months[i];
          if (month.month.endsWith('-12-01')) {
            let startMonthIdx = Math.min(i+11, this.months.length-1) //Don't go too far into past
            await this.selectMonths(this.months[startMonthIdx].month, this.months[i].month);
            break;
          }
        }
        break;
      case '12':
        let startMonthIdx = Math.min(currentMonthIdx+11, this.months.length-1) //Don't go too far into past
        await this.selectMonths(this.months[startMonthIdx].month, currentMonth.month);
        break;
      case 'ytd':
        // Go to current month, work backwards to prev Jan.
        for (let i = currentMonthIdx; i < this.months.length; i++) {
          const month = this.months[i];
          if (month.month.endsWith('-01-01')) {
            await this.selectMonths(this.months[i].month, currentMonth.month);
            break;
          }
        }
        break;
      case 'curr':
      default:
        await this.selectMonths(currentMonth.month, currentMonth.month);
        break;
    }
    
    return;
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
    result.budgetCategoryGroups = this.budgetForm.value.categoryGroups;
    result.currencyIsoCode = this.currencyIsoCode;

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
    const overrides = NoteUtility.getNoteOverrides(account.note, balance);

    if (overrides.contributionBudget !== undefined) {
      return overrides.contributionBudget;
    }

    if (account.type === ynab.Account.TypeEnum.InvestmentAccount || account.type === ynab.Account.TypeEnum.OtherAsset) {
      return balance;
    }

    return 0;
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
        info: c.info,
        ignore: c.ignore
      })))
    }));

    this.budgetForm.setControl('categoryGroups', this.formBuilder.array(categoryGroupFormGroups));
    this.budgetForm.setControl('accounts', this.formBuilder.array(mappedAccounts));
  }
}
