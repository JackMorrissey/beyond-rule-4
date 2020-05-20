import { CalculateInput } from './calculate-input.model';
import { round } from '../utilities/number-utility';

export class Forecast {
  monthlyForecasts: MonthlyForecast[];
  month0Date: Date;

  public constructor(calculateInput: CalculateInput, month0Date?: Date) {
    if (!calculateInput)
      return;
    if (!this.month0Date) {
      this.month0Date = new Date();
    }
    this.month0Date.setDate(1); // make it the first of the month
    this.computeForecast(calculateInput);
    this.setDates();
  }

  public getDistanceFromFirstMonthText(forecastDate: Date): string {
    let monthDifference =
      ((forecastDate.getFullYear() - this.month0Date.getFullYear()) * 12)
      + (forecastDate.getMonth() - this.month0Date.getMonth());

    if (monthDifference === 0) {
      return;
    }

    const inPast = monthDifference < 0;
    monthDifference = Math.abs(monthDifference);

    const months = monthDifference % 12;
    const years = (monthDifference - months) / 12;
    const difference = this.getTimeString(years, 'year') + this.getTimeString(months, 'month');
    const suffix = inPast ? 'ago' : '';
    return difference + suffix;
  }

  private getTimeString(timeDifference: number, unit: string): string {
    if (timeDifference === 0) {
      return '';
    }
    if (timeDifference === 1) {
      return `1 ${unit} `;
    }
    return `${timeDifference} ${unit}s `;
  }

  private computeForecast(calculateInput: CalculateInput) {
    const stopForecastingAmount = calculateInput.fiNumber * 1.6; // default to a bit more than Fat FI.

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
      totalReturns: 0
    })];
    while (currentNetWorth < stopForecastingAmount && month < 1000) {
      const contribution = calculateInput.monthlyContribution;
      const newNetWorth = round(((currentNetWorth + contribution) * 100 * monthlyAverageGrowth) / 100);
      const interestGain = round(newNetWorth - currentNetWorth - contribution);
      const timesAnnualExpenses = round(newNetWorth / annualExpenses);
      month++;
      totalContributions += contribution;
      const totalReturns = round(newNetWorth - totalContributions);
      monthlyForecasts.push(new MonthlyForecast({
        monthIndex: month,
        netWorth: newNetWorth,
        lastMonthNetWorth: currentNetWorth,
        contribution: contribution,
        interestGains: interestGain,
        timesAnnualExpenses: timesAnnualExpenses,
        totalContributions: totalContributions,
        totalReturns: totalReturns
      }));
      currentNetWorth = newNetWorth;
    }
    this.monthlyForecasts = monthlyForecasts;
  }

  private setDates() {
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
  totalReturns: number;

  public constructor(init?: Partial<MonthlyForecast>) {
    Object.assign(this, init);
  }

  public toDateString() {
    return this.date.toLocaleString('en-us', { month: 'long', year: 'numeric' });
  }
}
