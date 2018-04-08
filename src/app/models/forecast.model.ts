export class Forecast {
  monthlyForecasts: MonthlyForecast[];

  public constructor(init?: Partial<Forecast>) {
    Object.assign(this, init);
  }
}

export class MonthlyForecast {
  monthIndex: number;
  netWorth: number;
  lastMonthNetWorth: number;
  contribution: number;
  interestGains: number;
  timesAnnualExpenses: number;
  totalContributions: number;
  totalInterestGains: number;

  public constructor(init?: Partial<MonthlyForecast>) {
    Object.assign(this, init);
  }
}
