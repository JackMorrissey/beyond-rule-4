export class Forecast {
  monthlyForecasts: MonthlyForecast[];
  monthIndex0Date: Date;

  public constructor(init?: Partial<Forecast>) {
    Object.assign(this, init);
    if (!this.monthIndex0Date) {
      this.monthIndex0Date = new Date();
      this.monthIndex0Date.setDate(1);
    }
    const firstMonth = this.monthIndex0Date.getMonth();
    this.monthlyForecasts.forEach(monthlyForecast => {
      const forecastDate = new Date(this.monthIndex0Date);
      forecastDate.setMonth(firstMonth + monthlyForecast.monthIndex);
      const month = forecastDate.getMonth() + 1;
      const monthString = month >= 10 ? `${month}` : `0${month}`;
      // monthlyForecast.dateDisplay = `${forecastDate.getFullYear()}-${monthString}`;
      monthlyForecast.date = forecastDate;
    });
  }
}

export class MonthlyForecast {
  monthIndex: number;
  date: Date;
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
