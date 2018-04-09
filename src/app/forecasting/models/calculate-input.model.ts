import { round } from '../utilities/number-utility';

export class CalculateInput {
  netWorth = 0;
  annualExpenses = 0;
  annualSafeWithdrawalRate = 0;
  expectedAnnualGrowthRate = 0;
  monthlyContribution = 0;
  leanFiPercentage = 0;

  public constructor(init?: Partial<CalculateInput>) {
    Object.assign(this, {
      annualSafeWithdrawalRate: 0.04,
      leanFiPercentage: 0.7,
      expectedAnnualGrowthRate: 0.07,
    }, init);
    this.round();
  }

  public round() {
    this.netWorth = round(this.netWorth);
    this.annualExpenses = round(this.annualExpenses);
    this.annualSafeWithdrawalRate = round(this.annualSafeWithdrawalRate);
    this.expectedAnnualGrowthRate = round(this.expectedAnnualGrowthRate);
    this.monthlyContribution = round(this.monthlyContribution);
    this.leanFiPercentage = round(this.leanFiPercentage);
  }
}
