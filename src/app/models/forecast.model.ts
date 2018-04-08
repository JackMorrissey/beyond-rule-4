import { CalculateInput } from './calculate-input.model';
import { round } from '../utilities/number-utility';

export class Forecast {
  monthlyForecasts: MonthlyForecast[];

  public constructor(calculateInput: CalculateInput, public month0Date: Date = new Date()) {

    this.computeForecast(calculateInput);
    this.setDates();
  }

  private computeForecast(calculateInput: CalculateInput) {
    const fiNumber = 1 / calculateInput.annualSafeWithdrawalRate * calculateInput.annualExpenses;
    const stopForecastingAmount = fiNumber * 1.3; // default to a bit more than Fat Fi.

    const annualExpenses = calculateInput.annualExpenses;
    const monthlyAverageGrowth = 1 + calculateInput.expectedAnnualGrowthRate / 12;
    const startingNetWorth = calculateInput.netWorth;
    let currentNetWorth = startingNetWorth;
    let totalContributions = currentNetWorth; // can't yet delve into the past
    let month = 0;
    const monthlyForecasts = [new MonthlyForecast({
      monthIndex: 0,
      netWorth: startingNetWorth,
      lastMonthNetWorth: 0,
      contribution: 0,
      interestGains: 0,
      timesAnnualExpenses: round(startingNetWorth / annualExpenses),
      totalContributions: totalContributions,
      totalInterestGains: 0
    })];
    while (currentNetWorth < stopForecastingAmount && month < 1000) {
      const contribution = calculateInput.monthlyContribution;
      const newNetWorth = round(((currentNetWorth + contribution) * 100 * monthlyAverageGrowth) / 100);
      const interestGain = round(newNetWorth - currentNetWorth - contribution);
      const timesAnnualExpenses = round(newNetWorth / annualExpenses);
      month++;
      totalContributions += contribution;
      const totalInterestGains = round(newNetWorth - totalContributions);
      monthlyForecasts.push(new MonthlyForecast({
        monthIndex: month,
        netWorth: newNetWorth,
        lastMonthNetWorth: currentNetWorth,
        contribution: contribution,
        interestGains: interestGain,
        timesAnnualExpenses: timesAnnualExpenses,
        totalContributions: totalContributions,
        totalInterestGains: totalInterestGains
      }));
      currentNetWorth = newNetWorth;
    }
    this.monthlyForecasts = monthlyForecasts;
  }

  private setDates() {
    if (!this.month0Date) {
      this.month0Date = new Date();
      this.month0Date.setDate(1);
    }
    const firstMonth = this.month0Date.getMonth();
    this.monthlyForecasts.forEach(monthlyForecast => {
      const forecastDate = new Date(this.month0Date);
      forecastDate.setMonth(firstMonth + monthlyForecast.monthIndex);
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
