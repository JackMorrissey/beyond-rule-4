import { CalculateInput } from './calculate-input.model';
import { round } from '../utilities/number-utility';
import { birthdateToDate } from '../input/ynab/birthdate-utility';

export class Forecast {
  monthlyForecasts: MonthlyForecast[];
  month0Date: Date;
  birthdate: Date;
  visualizingCoast: Boolean;

  public constructor(calculateInput: CalculateInput, forNumber: 'fiNumber' | 'leanFiNumber' = 'fiNumber', month0Date?: Date) {
    if (!calculateInput) {
      return;
    }
    // Set month0Date first since computeForecast needs it for time-varying values
    this.month0Date = month0Date || new Date();
    this.month0Date.setDate(1); // make it the first of the month
    this.birthdate = birthdateToDate(calculateInput.birthdate);
    this.visualizingCoast = calculateInput.visualCoastDate !== null && this.birthdate !== null;
    this.computeForecast(calculateInput, forNumber);
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

  private computeForecast(calculateInput: CalculateInput, forNumber: 'fiNumber' | 'leanFiNumber' = 'fiNumber') {
    const now = new Date();
    const retirementDate = new Date(this.birthdate.getTime());
    retirementDate.setFullYear(retirementDate.getFullYear() + (calculateInput.targetRetirementAge || 0));
    
    const yearsDiff = retirementDate.getFullYear() - now.getFullYear();
    const monthsDiff = retirementDate.getMonth() - now.getMonth();      
    const monthsUntilRetirement = (yearsDiff * 12) + monthsDiff;
      
    const stopForecastingMonth = Math.max(monthsUntilRetirement + 6, 0);
    console.log(stopForecastingMonth);
    const stopForecastingAmount = calculateInput[forNumber] * 1.6; // default to a bit more than Fat FI.

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

    // coastFI
    const visualCoastDate = calculateInput.visualCoastDate;
    const initialDate = new Date(this.month0Date);
    const initialCoastFi = calculateInput.getCoastFiNumberAt(initialDate);
    let coastFiProjectedNetWorth: number | null = null;

    if (this.visualizingCoast) {
      if (visualCoastDate <= initialDate) {
        coastFiProjectedNetWorth = startingNetWorth;
      }
    } else if (initialCoastFi !== null && startingNetWorth >= initialCoastFi) {
      coastFiProjectedNetWorth = startingNetWorth;
    }

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
      coastFiProjection: coastFiProjectedNetWorth ?? undefined
    })];

    while ((currentNetWorth < stopForecastingAmount || (month < stopForecastingMonth && calculateInput.simulateToRetirement)) && month < 1000) {
      month++;
      const monthString = this.getMonthString(month);
      const currentDate = new Date(this.month0Date);
      currentDate.setMonth(currentDate.getMonth() + month);

      // Get time-varying contribution and expenses for this month
      const contribution = (this.visualizingCoast && visualCoastDate <= currentDate) ? 0 : calculateInput.getMonthlyContributionAt(monthString); // if visualizingCoast: stop contributing
      const annualExpenses = calculateInput.getAnnualExpensesAt(monthString);
      const leanAnnualExpenses = calculateInput.getLeanAnnualExpensesAt(monthString);

      const newNetWorth = round(((currentNetWorth + contribution) * 100 * monthlyAverageGrowth) / 100);
      const interestGain = round(newNetWorth - currentNetWorth - contribution);
      const timesAnnualExpenses = round(newNetWorth / (annualExpenses || baseAnnualExpenses || 1));
      totalContributions += contribution;
      const totalReturns = round(newNetWorth - totalContributions);

      // coastFI
      if (coastFiProjectedNetWorth !== null) {
        // project growth without contributions
        coastFiProjectedNetWorth = round((coastFiProjectedNetWorth * 100 * monthlyAverageGrowth) / 100);
      } else {
        // Check if we hit Coast FI this month
        const coastFiNumber = calculateInput.getCoastFiNumberAt(currentDate);
        if (this.visualizingCoast) {
          if (visualCoastDate <= currentDate) {
            coastFiProjectedNetWorth = newNetWorth;
          }
        } else if (coastFiNumber !== null && newNetWorth >= coastFiNumber) {
          coastFiProjectedNetWorth = newNetWorth;
        }
      }

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
        coastFiProjection: coastFiProjectedNetWorth ?? undefined
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
  coastFiProjection?: number;

  public constructor(init?: Partial<MonthlyForecast>) {
    Object.assign(this, init);
  }

  public toDateString() {
    return this.date.toLocaleString('en-us', { month: 'long', year: 'numeric' });
  }
}
