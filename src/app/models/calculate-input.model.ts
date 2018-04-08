export class CalculateInput {
  netWorth: number;
  annualExpenses: number;
  annualSafeWithdrawlRate: number;
  expectedAnnualGrowthRate: number;
  monthlyContribution: number;
  leanFiPercentage: number;

  public constructor(init?: Partial<CalculateInput>) {
    this.annualSafeWithdrawlRate = 0.04;
    this.leanFiPercentage = 0.7;
    this.expectedAnnualGrowthRate = 0.08;
    Object.assign(this, init);
  }
}
