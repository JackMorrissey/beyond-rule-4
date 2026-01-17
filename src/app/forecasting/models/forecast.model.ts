import { CalculateInput } from './calculate-input.model';
import { round } from '../utilities/number-utility';
import { Birthdate } from '../input/ynab/birthdate-utility';

export class Forecast {
  monthlyForecasts: MonthlyForecast[];
  month0Date: Date;
  birthdate: Birthdate;

  public constructor(calculateInput: CalculateInput, month0Date?: Date) {
    if (!calculateInput) {
      return;
    }
    // Set month0Date first since computeForecast needs it for time-varying values
    this.month0Date = month0Date || new Date();
    this.month0Date.setDate(1); // make it the first of the month
    this.birthdate = calculateInput.birthdate;
    this.computeForecast(calculateInput);
    this.setDates();
  }

  public getDistanceFromFirstMonthText(forecastDate: Date): string {
    const inPast = forecastDate < this.month0Date;
    const difference = this.getDistanceFromDateText(forecastDate, this.month0Date);
    const suffix = inPast ? 'ago' : '';
    return difference ? difference + suffix: undefined;
  }

  public getDistanceFromDateText(forecastDate: Date, fromDate: Date): string {
    if (!forecastDate || !fromDate) {
      return;
    }

    let monthDifference =
      ((forecastDate.getFullYear() - fromDate.getFullYear()) * 12)
      + (forecastDate.getMonth() - fromDate.getMonth());

    if (monthDifference === 0) {
      return;
    }

    monthDifference = Math.abs(monthDifference);
    const months = monthDifference % 12;
    const years = (monthDifference - months) / 12;
    return this.getTimeString(years, 'year') + this.getTimeString(months, 'month');
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

    const baseAnnualExpenses = calculateInput.annualExpenses;
    const monthlyAverageGrowth = 1 + calculateInput.expectedAnnualGrowthRate / 12;
    const startingNetWorth = calculateInput.netWorth;
    let currentNetWorth = startingNetWorth;
    let totalContributions = currentNetWorth; // can't yet delve into the past
    let month = 0;

    // Get the initial month string for time-varying values
    const initialMonthString = this.getMonthString(0);
    const initialAnnualExpenses = calculateInput.getAnnualExpensesAt(initialMonthString);
    const initialLeanAnnualExpenses = calculateInput.getLeanAnnualExpensesAt(initialMonthString);

    const monthlyForecasts = [new MonthlyForecast({
      monthIndex: 0,
      netWorth: startingNetWorth,
      lastMonthNetWorth: 0,
      contribution: 0,
      interestGains: 0,
      timesAnnualExpenses: round(startingNetWorth / (initialAnnualExpenses || baseAnnualExpenses || 1)),
      totalContributions: totalContributions,
      totalReturns: 0,
      annualExpenses: initialAnnualExpenses,
      leanAnnualExpenses: initialLeanAnnualExpenses,
    })];

    while (currentNetWorth < stopForecastingAmount && month < 1000) {
      month++;
      const monthString = this.getMonthString(month);

      // Get time-varying contribution and expenses for this month
      const contribution = calculateInput.getMonthlyContributionAt(monthString);
      const annualExpenses = calculateInput.getAnnualExpensesAt(monthString);
      const leanAnnualExpenses = calculateInput.getLeanAnnualExpensesAt(monthString);

      const newNetWorth = round(((currentNetWorth + contribution) * 100 * monthlyAverageGrowth) / 100);
      const interestGain = round(newNetWorth - currentNetWorth - contribution);
      const timesAnnualExpenses = round(newNetWorth / (annualExpenses || baseAnnualExpenses || 1));
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
        totalReturns: totalReturns,
        annualExpenses: annualExpenses,
        leanAnnualExpenses: leanAnnualExpenses,
      }));
      currentNetWorth = newNetWorth;
    }
    this.monthlyForecasts = monthlyForecasts;
  }

  /**
   * Convert a month index to a YYYY-MM string based on month0Date.
   */
  private getMonthString(monthIndex: number): string {
    const date = new Date(this.month0Date);
    date.setMonth(date.getMonth() + monthIndex);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
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
  age: Date;
  netWorth: number;
  lastMonthNetWorth: number;
  contribution: number;
  interestGains: number;
  timesAnnualExpenses: number;
  totalContributions: number;
  totalReturns: number;
  annualExpenses: number;
  leanAnnualExpenses: number;

  public constructor(init?: Partial<MonthlyForecast>) {
    Object.assign(this, init);
  }

  public toDateString() {
    return this.date.toLocaleString('en-us', { month: 'long', year: 'numeric' });
  }
}
