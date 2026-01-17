import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormArray,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import * as ynab from 'ynab';

import { YnabApiService } from '../../../ynab-api/ynab-api.service';
import { CalculateInput } from '../../models/calculate-input.model';
import {
  TimeSeries,
  aggregateTimeSeries,
} from '../../models/time-series.model';
import {
  ScheduledChange,
  ScheduledChangesState,
  SCHEDULED_CHANGES_STORAGE_KEY,
  BaselineOverride,
  BaselineOverridesState,
  BASELINE_OVERRIDES_STORAGE_KEY,
} from '../../models/scheduled-change.model';
import { round } from '../../utilities/number-utility';
import CategoryUtility from './category-utility';
import NoteUtility, { Overrides } from './note-utility';
import { Birthdate } from './birthdate-utility';
import { getSelectedMonths, QuickSelectMonthChoice } from './months-utility';

@Component({
  selector: 'app-ynab',
  templateUrl: 'ynab.component.html',
  styleUrls: ['./ynab.component.css'],
  standalone: false,
})
export class YnabComponent implements OnInit {
  @Output() calculateInputChange = new EventEmitter<CalculateInput>();

  budgetForm: UntypedFormGroup;
  displayContributionInfo = true;
  currencyIsoCode = 'USD';
  public safeWithdrawalRatePercentage = 4.0;
  public expectedAnnualGrowthRate = 7.0;
  public expectedExternalAnnualContributions = 0;
  public additionalLumpSumNeeded = 0;

  public budgets: ynab.BudgetSummary[];
  public budget: ynab.BudgetDetail;
  public months: ynab.MonthDetail[];
  public currentMonth: ynab.MonthDetail;
  public selectedMonthA: ynab.MonthDetail;
  public selectedMonthB: ynab.MonthDetail;
  public includeHiddenYnabCategories = false;
  public categoryGroupsWithCategories: ynab.CategoryGroupWithCategories[];

  public ynabNetWorth: number;
  public netWorth: number;
  public categoriesDisplay: any;
  public monthlyExpenses: number;
  public leanMonthlyExpenses: number;
  public expenses: {
    ynab: {
      monthly: number;
      annual: number;
    };
    fi: {
      monthly: number;
      annual: number;
    };
    leanFi: {
      monthly: number;
      annual: number;
    };
  };
  public contributionCategories: any;
  public isUsingSampleData = false;
  public isReloadingBudget = false;
  public birthdate: Birthdate;

  // Scheduled changes state
  public scheduledChanges: ScheduledChange[] = [];
  public scheduledChangesEnabled = true;
  private disabledChangeIds: Set<string> = new Set();

  // Baseline overrides state
  public baselineOverrides: BaselineOverride[] = [];
  public baselineOverridesEnabled = true;
  private disabledBaselineIds: Set<string> = new Set();

  constructor(
    private ynabService: YnabApiService,
    private formBuilder: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
  ) {
    this.expenses = {
      ynab: {
        monthly: 0,
        annual: 0,
      },
      fi: {
        monthly: 0,
        annual: 0,
      },
      leanFi: {
        monthly: 0,
        annual: 0,
      },
    };

    const safeWithdrawalRatePercentageStorage = parseFloat(
      window.localStorage.getItem('br4-safe-withdrawal-rate'),
    );
    if (
      !!safeWithdrawalRatePercentageStorage &&
      !isNaN(safeWithdrawalRatePercentageStorage)
    ) {
      this.safeWithdrawalRatePercentage = safeWithdrawalRatePercentageStorage;
    }

    const expectedAnnualGrowthRateStorage = parseFloat(
      window.localStorage.getItem('br4-expect-annual-growth-rate'),
    );
    if (
      !!expectedAnnualGrowthRateStorage &&
      !isNaN(expectedAnnualGrowthRateStorage)
    ) {
      this.expectedAnnualGrowthRate = expectedAnnualGrowthRateStorage;
    }

    try {
      this.birthdate = JSON.parse(window.localStorage.getItem('br4-birthdate'));
    } catch {
      this.birthdate = null;
    }

    // Load scheduled changes state from localStorage
    try {
      const storedState = JSON.parse(
        window.localStorage.getItem(SCHEDULED_CHANGES_STORAGE_KEY),
      ) as ScheduledChangesState;
      if (storedState) {
        this.scheduledChangesEnabled = storedState.globalEnabled;
        this.disabledChangeIds = new Set(storedState.disabledChangeIds || []);
      }
    } catch {
      // Ignore parse errors, use defaults
    }

    // Load baseline overrides state from localStorage
    try {
      const storedBaselineState = JSON.parse(
        window.localStorage.getItem(BASELINE_OVERRIDES_STORAGE_KEY),
      ) as BaselineOverridesState;
      if (storedBaselineState) {
        this.baselineOverridesEnabled = storedBaselineState.globalEnabled;
        this.disabledBaselineIds = new Set(
          storedBaselineState.disabledOverrideIds || [],
        );
      }
    } catch {
      // Ignore parse errors, use defaults
    }

    const externalContributionsStorage = parseFloat(
      window.localStorage.getItem('br4-external-annual-contributions'),
    );
    if (
      !!externalContributionsStorage &&
      !isNaN(externalContributionsStorage)
    ) {
      this.expectedExternalAnnualContributions = externalContributionsStorage;
    }

    const additionalLumpSumStorage = parseFloat(
      window.localStorage.getItem('br4-additional-lump-sum'),
    );
    if (!!additionalLumpSumStorage && !isNaN(additionalLumpSumStorage)) {
      this.additionalLumpSumNeeded = additionalLumpSumStorage;
    }

    this.budgetForm = this.formBuilder.group({
      selectedBudget: ['', [Validators.required]],
      selectedMonthA: ['', [Validators.required]],
      selectedMonthB: ['', [Validators.required]],
      monthlyContribution: [0, [Validators.required]],
      includeHiddenYnabCategories: [true],
      categoryGroups: this.formBuilder.array([]),
      accounts: this.formBuilder.array([]),
      safeWithdrawalRatePercentage: [
        this.safeWithdrawalRatePercentage,
        [Validators.required, Validators.max(99.99), Validators.max(0.01)],
      ],
      expectedAnnualGrowthRate: [
        this.expectedAnnualGrowthRate,
        [Validators.required, Validators.max(99.99), Validators.max(0.01)],
      ],
      birthdate: [this.birthdate, [Validators.required]],
      expectedExternalAnnualContributions: [
        this.expectedExternalAnnualContributions,
      ],
      additionalLumpSumNeeded: [this.additionalLumpSumNeeded],
    });
  }

  get categoryGroups(): UntypedFormArray {
    return this.budgetForm.get('categoryGroups') as UntypedFormArray;
  }

  get accounts(): UntypedFormArray {
    return this.budgetForm.get('accounts') as UntypedFormArray;
  }

  async ngOnInit() {
    this.isUsingSampleData = this.ynabService.isUsingSampleData();

    const formChanges = this.budgetForm.valueChanges.pipe(
      debounce(() => timer(500)),
    );
    formChanges.subscribe(() => {
      this.handleFormChanges();
    });

    this.budgets = await this.ynabService.getBudgets();

    const budgetId = this.setInitialSelectedBudget();
    await this.selectBudget(budgetId);
  }

  recalculate() {
    // Collect scheduled changes and baseline overrides for UI display
    this.collectScheduledChanges();
    this.collectBaselineOverrides();

    const fiMonthlyExpenses = this.getMonthlyExpenses(
      this.budgetForm.value.categoryGroups,
      'fiBudget',
    );
    const leanMonthlyExpenses = this.getMonthlyExpenses(
      this.budgetForm.value.categoryGroups,
      'leanFiBudget',
    );
    const retrievedBudgetedMonthlyExpenses = this.getMonthlyExpenses(
      this.budgetForm.value.categoryGroups,
      'retrievedBudgeted',
    );

    // Build time series for expenses (respecting enabled state)
    const fiExpensesSeries = this.getExpensesTimeSeries(
      this.budgetForm.value.categoryGroups,
      'computedFiBudgetSchedule',
      'fiBudget',
      'fiBudget',
    );
    const leanFiExpensesSeries = this.getExpensesTimeSeries(
      this.budgetForm.value.categoryGroups,
      'computedLeanFiBudgetSchedule',
      'leanFiBudget',
      'leanFiBudget',
    );

    // Get contribution with series (respecting enabled state)
    const contributionData = this.getMonthlyContribution(
      this.budgetForm.value.categoryGroups,
      this.accounts.controls,
    );

    this.setNetWorth();

    this.expenses = {
      ynab: {
        monthly: retrievedBudgetedMonthlyExpenses,
        annual: retrievedBudgetedMonthlyExpenses * 12,
      },
      fi: {
        monthly: fiMonthlyExpenses,
        annual: fiMonthlyExpenses * 12,
      },
      leanFi: {
        monthly: leanMonthlyExpenses,
        annual: leanMonthlyExpenses * 12,
      },
    };

    const result = new CalculateInput();
    result.annualExpenses = this.expenses.fi.annual;
    result.leanAnnualExpenses = this.expenses.leanFi.annual;
    result.netWorth = this.netWorth;
    result.monthlyContribution = this.budgetForm.value.monthlyContribution;
    result.budgetCategoryGroups = this.budgetForm.value.categoryGroups;
    result.currencyIsoCode = this.currencyIsoCode;
    result.monthFromName = this.selectedMonthA.month;
    result.monthToName = this.selectedMonthB.month;
    result.birthdate = this.birthdate;

    // Add time series data
    result.monthlyContributionSeries = contributionData.series;
    result.annualExpensesSeries = fiExpensesSeries;
    result.leanAnnualExpensesSeries = leanFiExpensesSeries;

    result.annualSafeWithdrawalRate = Math.max(
      0,
      this.safeWithdrawalRatePercentage / 100,
    );
    result.expectedAnnualGrowthRate = Math.max(
      0,
      this.expectedAnnualGrowthRate / 100,
    );
    result.expectedExternalAnnualContributions = Math.max(
      0,
      this.expectedExternalAnnualContributions,
    );
    result.additionalLumpSumNeeded = Math.max(0, this.additionalLumpSumNeeded);

    result.roundAll();
    this.calculateInputChange.emit(result);
  }

  async selectBudget(budgetId: string) {
    this.calculateInputChange.emit(undefined);
    this.budget = await this.ynabService.getBudgetById(budgetId);
    window.localStorage.setItem('br4-selected-budget', this.budget.id);

    this.months = this.budget.months;

    try {
      this.currentMonth = await this.ynabService.getMonth(budgetId, 'current');
    } catch {
      // on older accounts, this can 404 if they're not up to date. That's fine, we'll use the first month
      this.currentMonth = this.months[0];
    }

    this.categoryGroupsWithCategories =
      await this.ynabService.getCategoryGroupsWithCategories(this.budget.id);
    this.currencyIsoCode = this.budget.currency_format
      ? this.budget.currency_format.iso_code
      : 'USD';

    this.includeHiddenYnabCategories = !!window.localStorage.getItem(
      'br4-include-hidden-ynab-categories',
    );

    const selectedMonths = getSelectedMonths(
      this.currentMonth,
      this.months,
      'previousChoice',
    );
    await this.selectMonths(selectedMonths.from.month, selectedMonths.to.month);
  }

  async reloadBudget(): Promise<void> {
    if (!this.budget || this.isReloadingBudget) {
      return;
    }
    this.isReloadingBudget = true;
    try {
      await this.selectBudget(this.budget.id);
    } catch (error) {
      console.error('Failed to reload budget:', error);
    } finally {
      this.isReloadingBudget = false;
    }
  }

  toggleIncludeHiddenYnabCategories(newValue: boolean) {
    this.includeHiddenYnabCategories = newValue;
    if (newValue) {
      window.localStorage.setItem(
        'br4-include-hidden-ynab-categories',
        newValue.toString(),
      );
    } else {
      window.localStorage.removeItem('br4-include-hidden-ynab-categories');
    }
  }

  /**
   * Select months and reset the form with the categories
   *
   * @param monthA start month
   * @param monthB end month
   */
  async selectMonths(monthA: string, monthB: string) {
    const months = this.setMonths(monthA, monthB);

    const mappedAccounts = this.mapAccounts(this.budget.accounts);

    const mappedCategoryGroups = CategoryUtility.mapCategoryGroups(
      this.categoryGroupsWithCategories,
      months,
      this.includeHiddenYnabCategories,
    );
    const monthlyContribution = this.getMonthlyContribution(
      mappedCategoryGroups,
      mappedAccounts,
    );
    this.contributionCategories = monthlyContribution.categories;

    this.resetForm(
      mappedCategoryGroups,
      monthlyContribution.value,
      mappedAccounts,
    );

    this.recalculate();
  }

  /* Chooses months based on common decisions. Options: All, Last calendar year, Last 12 months, Year to date, Current month. */
  async quickChooseMonths(choice: QuickSelectMonthChoice) {
    // Get some etc facts that are shared by some of the buttons below.
    const currentMonth = this.currentMonth || this.months[0];
    let currentMonthIdx = 0;
    for (let i = 0; i < this.months.length; i++) {
      if (currentMonth.month === this.months[i].month) {
        currentMonthIdx = i;
      }
    }

    const selectedMonths = getSelectedMonths(currentMonth, this.months, choice);
    await this.selectMonths(selectedMonths.from.month, selectedMonths.to.month);
  }

  handlePercentageFormChanges() {
    const parsedSafeWithdrawalRatePercentage = Number.parseFloat(
      this.budgetForm.value.safeWithdrawalRatePercentage,
    );
    if (
      !Number.isNaN(parsedSafeWithdrawalRatePercentage) &&
      parsedSafeWithdrawalRatePercentage !== this.safeWithdrawalRatePercentage
    ) {
      this.safeWithdrawalRatePercentage = parsedSafeWithdrawalRatePercentage;
      // local storage
      window.localStorage.setItem(
        'br4-safe-withdrawal-rate',
        parsedSafeWithdrawalRatePercentage.toString(),
      );
    }
    const parsedExpectedAnnualGrowthRate = Number.parseFloat(
      this.budgetForm.value.expectedAnnualGrowthRate,
    );
    if (!Number.isNaN(parsedExpectedAnnualGrowthRate)) {
      this.expectedAnnualGrowthRate = parsedExpectedAnnualGrowthRate;
      // local storage
      window.localStorage.setItem(
        'br4-expect-annual-growth-rate',
        parsedExpectedAnnualGrowthRate.toString(),
      );
    }

    const parsedExternalContributions = Number.parseFloat(
      this.budgetForm.value.expectedExternalAnnualContributions,
    );
    if (!Number.isNaN(parsedExternalContributions)) {
      this.expectedExternalAnnualContributions = parsedExternalContributions;
      window.localStorage.setItem(
        'br4-external-annual-contributions',
        parsedExternalContributions.toString(),
      );
    }

    const parsedAdditionalLumpSum = Number.parseFloat(
      this.budgetForm.value.additionalLumpSumNeeded,
    );
    if (!Number.isNaN(parsedAdditionalLumpSum)) {
      this.additionalLumpSumNeeded = parsedAdditionalLumpSum;
      window.localStorage.setItem(
        'br4-additional-lump-sum',
        parsedAdditionalLumpSum.toString(),
      );
    }
  }

  handleFormChanges() {
    let toggledHidden = false;
    if (
      this.includeHiddenYnabCategories !==
      this.budgetForm.value.includeHiddenYnabCategories
    ) {
      toggledHidden = true;
      this.toggleIncludeHiddenYnabCategories(
        this.budgetForm.value.includeHiddenYnabCategories,
      );
    }

    this.handlePercentageFormChanges();

    this.birthdate = this.budgetForm.value.birthdate;
    window.localStorage.setItem(
      'br4-birthdate',
      JSON.stringify(this.birthdate),
    );

    const selectedBudget = this.budgetForm.value.selectedBudget;
    if (this.budget.id !== selectedBudget) {
      // calls selectMonths after it's done resetting
      this.selectBudget(selectedBudget);
      return;
    }

    if (
      toggledHidden ||
      this.selectedMonthA.month !== this.budgetForm.value.selectedMonthA ||
      this.selectedMonthB.month !== this.budgetForm.value.selectedMonthB
    ) {
      this.selectMonths(
        this.budgetForm.value.selectedMonthA,
        this.budgetForm.value.selectedMonthB,
      );
      return;
    }

    this.recalculate();
  }

  /**
   * Collect all scheduled changes from the form data for display in the UI.
   */
  collectScheduledChanges(): void {
    const changes: ScheduledChange[] = [];
    const categoryGroups = this.budgetForm.value.categoryGroups || [];

    for (const categoryGroup of categoryGroups) {
      if (!categoryGroup.categories) continue;

      for (const category of categoryGroup.categories) {
        // Check contribution schedules
        const contributionSchedule = category.contributionBudgetSchedule;
        if (contributionSchedule?.schedule?.length > 0) {
          for (const point of contributionSchedule.schedule) {
            const id = `${category.name}-contribution-${point.effectiveDate}`;
            changes.push({
              id,
              categoryName: category.name,
              categoryId: category.name, // Using name as ID since it's more stable
              type: 'contribution',
              baselineValue: category.contributionBudget || 0,
              scheduledValue: point.value,
              effectiveDate: point.effectiveDate,
              enabled: !this.disabledChangeIds.has(id),
            });
          }
        }

        // Check FI budget schedules
        const fiBudgetSchedule = category.computedFiBudgetSchedule;
        if (fiBudgetSchedule?.schedule?.length > 0) {
          for (const point of fiBudgetSchedule.schedule) {
            const id = `${category.name}-fiBudget-${point.effectiveDate}`;
            changes.push({
              id,
              categoryName: category.name,
              categoryId: category.name,
              type: 'fiBudget',
              baselineValue:
                category.fiBudget || category.computedFiBudget || 0,
              scheduledValue: point.value,
              effectiveDate: point.effectiveDate,
              enabled: !this.disabledChangeIds.has(id),
            });
          }
        }

        // Check Lean FI budget schedules
        const leanFiBudgetSchedule = category.computedLeanFiBudgetSchedule;
        if (leanFiBudgetSchedule?.schedule?.length > 0) {
          for (const point of leanFiBudgetSchedule.schedule) {
            const id = `${category.name}-leanFiBudget-${point.effectiveDate}`;
            changes.push({
              id,
              categoryName: category.name,
              categoryId: category.name,
              type: 'leanFiBudget',
              baselineValue:
                category.leanFiBudget || category.computedLeanFiBudget || 0,
              scheduledValue: point.value,
              effectiveDate: point.effectiveDate,
              enabled: !this.disabledChangeIds.has(id),
            });
          }
        }
      }
    }

    // Sort by effective date
    changes.sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
    this.scheduledChanges = changes;
  }

  /**
   * Toggle an individual scheduled change on/off.
   * Note: change.enabled is already updated by ngModel binding before this is called.
   */
  toggleScheduledChange(change: ScheduledChange): void {
    if (change.enabled) {
      this.disabledChangeIds.delete(change.id);
    } else {
      this.disabledChangeIds.add(change.id);
    }
    this.saveScheduledChangesState();
    this.recalculate();
  }

  /**
   * Toggle all scheduled changes on/off via master switch.
   */
  toggleAllScheduledChanges(enabled: boolean): void {
    this.scheduledChangesEnabled = enabled;
    this.saveScheduledChangesState();
    this.recalculate();
  }

  /**
   * Get scheduled changes filtered by type.
   */
  getScheduledChangesByType(
    type: 'contribution' | 'fiBudget' | 'leanFiBudget',
  ): ScheduledChange[] {
    return this.scheduledChanges.filter((c) => c.type === type);
  }

  /**
   * Get the count of enabled scheduled changes.
   */
  getEnabledScheduleCount(): number {
    if (!this.scheduledChangesEnabled) return 0;
    return this.scheduledChanges.filter((c) => c.enabled).length;
  }

  /**
   * Save scheduled changes state to localStorage.
   */
  private saveScheduledChangesState(): void {
    const state: ScheduledChangesState = {
      globalEnabled: this.scheduledChangesEnabled,
      disabledChangeIds: Array.from(this.disabledChangeIds),
    };
    window.localStorage.setItem(
      SCHEDULED_CHANGES_STORAGE_KEY,
      JSON.stringify(state),
    );
  }

  /**
   * Collect all baseline overrides from categories and accounts for display in the UI.
   */
  collectBaselineOverrides(): void {
    const overrides: BaselineOverride[] = [];
    const categoryGroups = this.budgetForm.value.categoryGroups || [];

    for (const categoryGroup of categoryGroups) {
      if (!categoryGroup.categories) continue;

      for (const category of categoryGroup.categories) {
        // Check contribution override
        if (
          category.originalContributionBudget !== undefined &&
          category.contributionBudget !== category.originalContributionBudget
        ) {
          const id = `${category.name}-contribution-baseline`;
          overrides.push({
            id,
            categoryName: category.name,
            categoryId: category.name,
            source: 'category',
            type: 'contribution',
            originalValue: category.originalContributionBudget,
            overriddenValue: category.contributionBudget,
            enabled: !this.disabledBaselineIds.has(id),
          });
        }

        // Check FI budget override
        if (
          category.originalFiBudget !== undefined &&
          category.computedFiBudget !== category.originalFiBudget
        ) {
          const id = `${category.name}-fiBudget-baseline`;
          overrides.push({
            id,
            categoryName: category.name,
            categoryId: category.name,
            source: 'category',
            type: 'fiBudget',
            originalValue: category.originalFiBudget,
            overriddenValue: category.computedFiBudget,
            enabled: !this.disabledBaselineIds.has(id),
          });
        }

        // Check Lean FI budget override
        if (
          category.originalLeanFiBudget !== undefined &&
          category.computedLeanFiBudget !== category.originalLeanFiBudget
        ) {
          const id = `${category.name}-leanFiBudget-baseline`;
          overrides.push({
            id,
            categoryName: category.name,
            categoryId: category.name,
            source: 'category',
            type: 'leanFiBudget',
            originalValue: category.originalLeanFiBudget,
            overriddenValue: category.computedLeanFiBudget,
            enabled: !this.disabledBaselineIds.has(id),
          });
        }
      }
    }

    // Check accounts for portfolio and monthly contribution overrides
    for (const account of this.accounts.controls) {
      const ynabBalance = account.value.ynabBalance || 0;
      const balance = account.value.balance || 0;
      const monthlyContribution = account.value.monthlyContribution;

      // Check starting portfolio override (balance differs from ynabBalance)
      if (
        typeof balance === 'number' &&
        !isNaN(balance) &&
        balance !== 0 &&
        balance !== ynabBalance
      ) {
        const id = `${account.value.name}-startingPortfolio-baseline`;
        overrides.push({
          id,
          categoryName: account.value.name,
          categoryId: account.value.name,
          source: 'account',
          type: 'startingPortfolio',
          originalValue: ynabBalance,
          overriddenValue: balance,
          enabled: !this.disabledBaselineIds.has(id),
        });
      }

      // Check monthly contribution override from account
      if (
        typeof monthlyContribution === 'number' &&
        !isNaN(monthlyContribution) &&
        monthlyContribution !== 0
      ) {
        const id = `${account.value.name}-monthlyContribution-baseline`;
        overrides.push({
          id,
          categoryName: account.value.name,
          categoryId: account.value.name,
          source: 'account',
          type: 'monthlyContribution',
          originalValue: 0,
          overriddenValue: monthlyContribution,
          enabled: !this.disabledBaselineIds.has(id),
        });
      }
    }

    this.baselineOverrides = overrides;
  }

  /**
   * Toggle an individual baseline override on/off.
   * Note: override.enabled is already updated by ngModel binding before this is called.
   */
  toggleBaselineOverride(override: BaselineOverride): void {
    if (override.enabled) {
      this.disabledBaselineIds.delete(override.id);
    } else {
      this.disabledBaselineIds.add(override.id);
    }
    this.saveBaselineOverridesState();
    this.applyBaselineOverridesToForm();
    this.recalculate();
  }

  /**
   * Toggle all baseline overrides on/off via master switch.
   */
  toggleAllBaselineOverrides(enabled: boolean): void {
    this.baselineOverridesEnabled = enabled;
    this.saveBaselineOverridesState();
    this.applyBaselineOverridesToForm();
    this.recalculate();
  }

  /**
   * Get baseline overrides filtered by type.
   */
  getBaselineOverridesByType(
    type:
      | 'contribution'
      | 'fiBudget'
      | 'leanFiBudget'
      | 'startingPortfolio'
      | 'monthlyContribution',
  ): BaselineOverride[] {
    return this.baselineOverrides.filter((o) => o.type === type);
  }

  /**
   * Get the count of enabled baseline overrides.
   */
  getEnabledBaselineCount(): number {
    if (!this.baselineOverridesEnabled) return 0;
    return this.baselineOverrides.filter((o) => o.enabled).length;
  }

  /**
   * Save baseline overrides state to localStorage.
   */
  private saveBaselineOverridesState(): void {
    const state: BaselineOverridesState = {
      globalEnabled: this.baselineOverridesEnabled,
      disabledOverrideIds: Array.from(this.disabledBaselineIds),
    };
    window.localStorage.setItem(
      BASELINE_OVERRIDES_STORAGE_KEY,
      JSON.stringify(state),
    );
  }

  /**
   * Apply current baseline override state to form values.
   * When an override is disabled, use the original value instead of the overridden value.
   */
  private applyBaselineOverridesToForm(): void {
    const categoryGroups = this.categoryGroups.controls;

    for (let i = 0; i < categoryGroups.length; i++) {
      const categoryGroup = categoryGroups[i];
      const categories = (categoryGroup.get('categories') as UntypedFormArray)
        .controls;

      for (let j = 0; j < categories.length; j++) {
        const category = categories[j];
        const name = category.value.name;

        // Handle FI budget
        const fiBudgetId = `${name}-fiBudget-baseline`;
        const fiBudgetOverrideEnabled =
          this.baselineOverridesEnabled &&
          !this.disabledBaselineIds.has(fiBudgetId);
        const fiBudgetValue = fiBudgetOverrideEnabled
          ? category.value.computedFiBudget
          : category.value.originalFiBudget;
        if (fiBudgetValue !== undefined) {
          category.patchValue(
            { fiBudget: fiBudgetValue },
            { emitEvent: false },
          );
        }

        // Handle Lean FI budget
        const leanFiBudgetId = `${name}-leanFiBudget-baseline`;
        const leanFiBudgetOverrideEnabled =
          this.baselineOverridesEnabled &&
          !this.disabledBaselineIds.has(leanFiBudgetId);
        const leanFiBudgetValue = leanFiBudgetOverrideEnabled
          ? category.value.computedLeanFiBudget
          : category.value.originalLeanFiBudget;
        if (leanFiBudgetValue !== undefined) {
          category.patchValue(
            { leanFiBudget: leanFiBudgetValue },
            { emitEvent: false },
          );
        }
      }
    }

    // Handle account overrides
    for (const account of this.accounts.controls) {
      const name = account.value.name;

      // Handle starting portfolio
      const portfolioId = `${name}-startingPortfolio-baseline`;
      const portfolioOverrideEnabled =
        this.baselineOverridesEnabled &&
        !this.disabledBaselineIds.has(portfolioId);
      const portfolioValue = portfolioOverrideEnabled
        ? account.value.balance
        : account.value.ynabBalance;
      // Note: We don't patch balance here because it's the user-editable field
      // and the override is already reflected in the collected data
    }
  }

  private setInitialSelectedBudget(): string {
    let selectedBudget = 'last-used';

    const storageBudget = window.localStorage.getItem('br4-selected-budget');
    if (storageBudget && this.budgets.some((b) => b.id === storageBudget)) {
      selectedBudget = storageBudget;
    }

    const queryBudget = this.activatedRoute.snapshot.queryParams['budgetId'];
    if (queryBudget && this.budgets.some((b) => b.id === queryBudget)) {
      selectedBudget = queryBudget;
    }

    return selectedBudget;
  }

  private setMonths(monthA: string, monthB: string): ynab.MonthDetail[] {
    const result = new Array<ynab.MonthDetail>();
    let inRange = false;
    for (const month of this.months) {
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

  private getMonthlyExpenses(categoryGroups, budgetPropertyName) {
    const expenses = categoryGroups
      .map((categoryGroup) => {
        if (!categoryGroup.categories || !categoryGroup.categories.length) {
          return 0;
        }
        return categoryGroup.categories
          .map((category) => category[budgetPropertyName])
          .reduce((prev, next) => prev + next, 0);
      })
      .reduce((prev, next) => prev + next, 0);

    return round(expenses);
  }

  /**
   * Build a TimeSeries for expenses from category groups.
   * @param categoryGroups The category groups from the form
   * @param schedulePropertyName The property name for the schedule (e.g., 'computedFiBudgetSchedule')
   * @param budgetPropertyName The property name for baseline value (e.g., 'fiBudget')
   * @param scheduleType The type of schedule for checking enabled state
   */
  private getExpensesTimeSeries(
    categoryGroups: any[],
    schedulePropertyName: string,
    budgetPropertyName: string,
    scheduleType: 'fiBudget' | 'leanFiBudget',
  ): TimeSeries {
    const seriesList: TimeSeries[] = [];

    for (const categoryGroup of categoryGroups) {
      if (!categoryGroup.categories || !categoryGroup.categories.length) {
        continue;
      }
      for (const category of categoryGroup.categories) {
        const baseline = category[budgetPropertyName] || 0;
        const schedule = category[schedulePropertyName];

        const series = new TimeSeries(baseline);
        if (schedule && schedule.schedule && schedule.schedule.length > 0) {
          for (const point of schedule.schedule) {
            // Only add the point if scheduled changes are globally enabled
            // and this specific change is not disabled
            if (this.scheduledChangesEnabled) {
              const changeId = `${category.name}-${scheduleType}-${point.effectiveDate}`;
              if (!this.disabledChangeIds.has(changeId)) {
                series.addPoint(point.effectiveDate, point.value);
              }
            }
          }
        }
        seriesList.push(series);
      }
    }

    return aggregateTimeSeries(seriesList);
  }

  private setNetWorth() {
    let ynabNetWorth = 0;
    let netWorth = 0;
    this.accounts.controls.forEach((a) => {
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
    const mapped = accounts
      .filter((a) => !(a.closed || a.deleted))
      .map((account) => {
        const ynabBalance = ynab.utils.convertMilliUnitsToCurrencyAmount(
          account.balance,
        );
        const overrides = NoteUtility.getNoteOverrides(
          account.note,
          ynabBalance,
        );

        return this.formBuilder.group(
          Object.assign({}, account, {
            balance: this.getAccountBalance(account, ynabBalance, overrides),
            ynabBalance,
            monthlyContribution: overrides.monthlyContribution,
          }),
        );
      });
    return mapped;
  }

  private getAccountBalance(
    account: ynab.Account,
    ynabBalance: number,
    overrides: Overrides,
  ) {
    if (overrides.contributionBudget !== undefined) {
      return overrides.contributionBudget;
    }

    if (account.type === ynab.AccountType.OtherAsset) {
      return ynabBalance;
    }

    return 0;
  }

  private getMonthlyContribution(categoryGroups, accounts) {
    let contribution = 0;
    const categories = [];
    const seriesList: TimeSeries[] = [];

    if (categoryGroups) {
      categoryGroups.forEach((cg) => {
        cg.categories.forEach((c) => {
          if (c.contributionBudget) {
            contribution += c.contributionBudget;
            categories.push({
              name: c.name,
              value: c.contributionBudget,
              info: c.info,
              hidden: c.hidden,
            });

            // Build TimeSeries for this category
            const series = new TimeSeries(c.contributionBudget);
            const schedule = c.contributionBudgetSchedule;
            if (schedule && schedule.schedule && schedule.schedule.length > 0) {
              for (const point of schedule.schedule) {
                // Only add the point if scheduled changes are globally enabled
                // and this specific change is not disabled
                if (this.scheduledChangesEnabled) {
                  const changeId = `${c.name}-contribution-${point.effectiveDate}`;
                  if (!this.disabledChangeIds.has(changeId)) {
                    series.addPoint(point.effectiveDate, point.value);
                  }
                }
              }
            }
            seriesList.push(series);
          }
        });
      });
    }

    if (accounts) {
      accounts.forEach((a) => {
        const monthlyContribution = a.value.monthlyContribution;
        if (monthlyContribution) {
          contribution += monthlyContribution;
          categories.push({
            name: a.value.name,
            value: monthlyContribution,
            info: {
              mean: monthlyContribution,
              max: {
                value: monthlyContribution,
              },
              min: {
                value: monthlyContribution,
              },
            },
          });
          // For accounts, just use the static value (no schedule support for accounts yet)
          seriesList.push(new TimeSeries(monthlyContribution));
        }
      });
    }

    return {
      value: round(contribution),
      categories,
      series: aggregateTimeSeries(seriesList),
    };
  }

  private resetForm(categoriesDisplay, monthlyContribution, mappedAccounts) {
    this.budgetForm.reset({
      selectedBudget: this.budget.id,
      selectedMonthA: this.selectedMonthA.month,
      selectedMonthB: this.selectedMonthB.month,
      includeHiddenYnabCategories: this.includeHiddenYnabCategories,
      monthlyContribution,
      expectedAnnualGrowthRate: this.expectedAnnualGrowthRate,
      safeWithdrawalRatePercentage: this.safeWithdrawalRatePercentage,
      birthdate: this.birthdate,
      expectedExternalAnnualContributions:
        this.expectedExternalAnnualContributions,
      additionalLumpSumNeeded: this.additionalLumpSumNeeded,
    });

    const categoryGroupFormGroups = categoriesDisplay.map((cg) =>
      this.formBuilder.group({
        name: cg.name,
        id: cg.id,
        hidden: cg.hidden,
        categories: this.formBuilder.array(
          cg.categories.map((c) =>
            this.formBuilder.group({
              name: c.name,
              retrievedBudgeted: c.retrievedBudgeted,
              originalFiBudget: c.originalFiBudget,
              originalLeanFiBudget: c.originalLeanFiBudget,
              originalContributionBudget: c.originalContributionBudget,
              computedFiBudget: c.computedFiBudget,
              computedLeanFiBudget: c.computedLeanFiBudget,
              fiBudget: c.computedFiBudget,
              leanFiBudget: c.computedLeanFiBudget,
              info: c.info,
              ignore: c.ignore,
              hidden: c.hidden,
              contributionBudget: c.contributionBudget,
              contributionBudgetSchedule: c.contributionBudgetSchedule,
              computedFiBudgetSchedule: c.computedFiBudgetSchedule,
              computedLeanFiBudgetSchedule: c.computedLeanFiBudgetSchedule,
            }),
          ),
        ),
      }),
    );

    this.budgetForm.setControl(
      'categoryGroups',
      this.formBuilder.array(categoryGroupFormGroups),
    );
    this.budgetForm.setControl(
      'accounts',
      this.formBuilder.array(mappedAccounts),
    );
  }
}
