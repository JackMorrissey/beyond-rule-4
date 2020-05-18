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

  public constructor(init?: Partial<CalculateInput>) {
    Object.assign(this, {
      annualSafeWithdrawalRate: 0.04,
      leanFiPercentage: 0.7,
      expectedAnnualGrowthRate: 0.07,
    }, init);
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
  }

  get fiNumber() {
    return 1 / this.annualSafeWithdrawalRate * this.annualExpenses;
  }

  get leanFiNumber() {
    let leanFiNumber = this.fiNumber * this.leanFiPercentage;
    if (this.leanAnnualExpenses) {
      leanFiNumber = 1 / this.annualSafeWithdrawalRate * this.leanAnnualExpenses;
    }
    return leanFiNumber;
  }

}
