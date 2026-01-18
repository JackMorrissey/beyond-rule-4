import { Birthdate } from '../input/ynab/birthdate-utility';
import { TimeSeries } from './time-series.model';
import { round } from '../utilities/number-utility';

export class CalculateInput {
  netWorth = 0;
  annualExpenses = 0;
  leanAnnualExpenses = 0;
  annualSafeWithdrawalRate = 0;
  expectedAnnualGrowthRate = 0;
  monthlyContribution = 0;
  leanFiPercentage = 0;
  budgetCategoryGroups = [];
  currencyIsoCode = 'USD';
  monthFromName = '';
  monthToName = '';
  birthdate: Birthdate = null;
  expectedExternalAnnualContributions = 0;
  additionalLumpSumNeeded = 0;
  targetRetirementAge = 65;

  // Time series for dynamic values
  monthlyContributionSeries: TimeSeries | null = null;
  annualExpensesSeries: TimeSeries | null = null;
  leanAnnualExpensesSeries: TimeSeries | null = null;

  public constructor(init?: Partial<CalculateInput>) {
    Object.assign(
      this,
      {
        annualSafeWithdrawalRate: 0.04,
        leanFiPercentage: 0.7,
        expectedAnnualGrowthRate: 0.07,
      },
      init
    );
    this.roundAll();
  }

  public roundAll() {
    this.netWorth = round(this.netWorth);
    this.annualExpenses = round(this.annualExpenses);
    this.annualSafeWithdrawalRate = round(this.annualSafeWithdrawalRate, 4);
    this.expectedAnnualGrowthRate = round(this.expectedAnnualGrowthRate, 4);
    this.monthlyContribution = round(this.monthlyContribution);
    this.leanFiPercentage = round(this.leanFiPercentage);
    this.leanAnnualExpenses = round(this.leanAnnualExpenses);
    this.expectedExternalAnnualContributions = round(this.expectedExternalAnnualContributions);
    this.additionalLumpSumNeeded = round(this.additionalLumpSumNeeded);
  }

  get safeWithdrawalTimes() {
    return 1 / this.annualSafeWithdrawalRate;
  }

  get externalContributionReduction() {
    return this.safeWithdrawalTimes * this.expectedExternalAnnualContributions;
  }

  get fiNumber() {
    const baseFi = this.safeWithdrawalTimes * this.annualExpenses;
    return baseFi - this.externalContributionReduction + this.additionalLumpSumNeeded;
  }

  get leanFiNumber() {
    let baseLeanFi = this.fiNumber * this.leanFiPercentage;
    if (this.leanAnnualExpenses) {
      baseLeanFi = this.safeWithdrawalTimes * this.leanAnnualExpenses;
      baseLeanFi = baseLeanFi - this.externalContributionReduction + this.additionalLumpSumNeeded;
    }
    return baseLeanFi;
  }

  /**
   * Get the Coast FI number at a specific date.
   * Coast FI is the amount needed today where, with zero future contributions,
   * investment growth alone reaches your FI number by a target retirement age.
   *
   * Formula: coastFiNumber = fiNumber / (1 + annualGrowthRate)^yearsToTarget
   *
   * @param atDate The date to calculate Coast FI at
   * @returns The Coast FI number, or null if birthdate is not set
   */
  getCoastFiNumberAt(atDate: Date): number | null {
    if (!this.birthdate) {
      return null;
    }

    const birthdate = new Date(
      this.birthdate.year,
      this.birthdate.month - 1,
      this.birthdate.day
    );

    // Calculate current age in years
    const ageInMs = atDate.getTime() - birthdate.getTime();
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);

    // Calculate years to target retirement age
    const yearsToTarget = this.targetRetirementAge - ageInYears;

    // If already at or past target age, Coast FI equals FI number
    if (yearsToTarget <= 0) {
      return this.fiNumber;
    }

    // Coast FI = FI Number / (1 + growth rate)^years
    const coastFi =
      this.fiNumber / Math.pow(1 + this.expectedAnnualGrowthRate, yearsToTarget);

    return round(coastFi);
  }

  /**
   * Get the Coast FI number based on current date.
   * Returns null if birthdate is not set.
   */
  get coastFiNumber(): number | null {
    return this.getCoastFiNumberAt(new Date());
  }

  /**
   * Get the monthly contribution at a specific month.
   * Falls back to the static value if no time series is available.
   */
  getMonthlyContributionAt(month: string): number {
    if (this.monthlyContributionSeries) {
      return this.monthlyContributionSeries.getValueAt(month);
    }
    return this.monthlyContribution;
  }

  /**
   * Get the annual expenses at a specific month.
   * Falls back to the static value if no time series is available.
   */
  getAnnualExpensesAt(month: string): number {
    if (this.annualExpensesSeries) {
      return this.annualExpensesSeries.getValueAt(month) * 12;
    }
    return this.annualExpenses;
  }

  /**
   * Get the lean annual expenses at a specific month.
   * Falls back to the static value if no time series is available.
   */
  getLeanAnnualExpensesAt(month: string): number {
    if (this.leanAnnualExpensesSeries) {
      return this.leanAnnualExpensesSeries.getValueAt(month) * 12;
    }
    return this.leanAnnualExpenses;
  }

  /**
   * Get the FI number at a specific month based on dynamic expenses.
   */
  getFiNumberAt(month: string): number {
    const annualExpenses = this.getAnnualExpensesAt(month);
    return this.safeWithdrawalTimes * annualExpenses;
  }

  /**
   * Get the lean FI number at a specific month based on dynamic expenses.
   */
  getLeanFiNumberAt(month: string): number {
    const leanAnnualExpenses = this.getLeanAnnualExpensesAt(month);
    if (leanAnnualExpenses > 0) {
      return this.safeWithdrawalTimes * leanAnnualExpenses;
    }
    return this.getFiNumberAt(month) * this.leanFiPercentage;
  }

  /**
   * Check if there are any time-varying changes scheduled.
   */
  hasTimeVaryingValues(): boolean {
    return (
      (this.monthlyContributionSeries?.hasFutureChanges() ?? false) ||
      (this.annualExpensesSeries?.hasFutureChanges() ?? false) ||
      (this.leanAnnualExpensesSeries?.hasFutureChanges() ?? false)
    );
  }
}
