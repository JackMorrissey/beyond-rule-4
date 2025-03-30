import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { round } from '../../utilities/number-utility';
import { birthdateToDate } from '../../input/ynab/birthdate-utility';
import { CalculateInput } from '../../models/calculate-input.model';
import { Forecast, MonthlyForecast } from '../../models/forecast.model';

@Component({
  selector: 'app-fi-text',
  templateUrl: 'fi-text.component.html',
  standalone: false,
})
export class FiTextComponent implements OnInit, OnChanges {
  @Input() calculateInput: CalculateInput;
  @Input() forecast: Forecast;

  safeWithdrawalTimes: number;
  safeWithdrawalRate: number;
  expectedAnnualGrowthRate: number;
  fiNumber: number;
  fiMonthForecast: MonthlyForecast;
  fiDate: string;
  dateDistance: string;
  fiAge: string;

  leanFiNumber: number;
  leanFiDate: string;
  leanFiDateDistance: string;
  leanFiAge: string;

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    this.calculate();
  }

  calculate() {
    this.safeWithdrawalTimes = round(this.calculateInput.safeWithdrawalTimes);
    this.safeWithdrawalRate = round(
      this.calculateInput.annualSafeWithdrawalRate * 100
    );

    this.expectedAnnualGrowthRate = round(
      this.calculateInput.expectedAnnualGrowthRate * 100
    );

    const fiNumber = Math.max(0, round(this.calculateInput.fiNumber));
    this.fiNumber = fiNumber;

    const leanFiNumber = Math.max(0, round(this.calculateInput.leanFiNumber));
    this.leanFiNumber = leanFiNumber;

    if (!this.forecast) {
      return;
    }

    const foundFiForecast = this.forecast.monthlyForecasts.find(
      (f) => f.netWorth >= fiNumber
    );
    const birthdate = birthdateToDate(this.calculateInput.birthdate);

    if (!foundFiForecast) {
      this.fiDate = 'Never';
      this.dateDistance = 'Forever';
      this.fiMonthForecast = undefined;
      this.fiAge = undefined;
    } else {
      this.fiDate = foundFiForecast.toDateString();
      this.dateDistance =
        this.forecast.getDistanceFromFirstMonthText(foundFiForecast.date) ||
        '0 Months';
      this.fiMonthForecast = foundFiForecast;
      this.fiAge = birthdate && !isNaN(birthdate.getTime())
        ? this.forecast.getDistanceFromDateText(foundFiForecast.date, birthdate)
        : null;
    }

    const foundLeanFiForecast = this.forecast.monthlyForecasts.find(
      (f) => f.netWorth >= leanFiNumber
    );
    if (!foundLeanFiForecast) {
      this.leanFiDate = 'Never';
      this.leanFiDateDistance = 'Forever';
      this.leanFiAge = undefined;
    } else {
      this.leanFiDate = foundLeanFiForecast.toDateString();
      this.leanFiDateDistance =
        this.forecast.getDistanceFromFirstMonthText(foundLeanFiForecast.date) ||
        '0 Months';
      this.leanFiAge = birthdate && !isNaN(birthdate.getTime())
        ? this.forecast.getDistanceFromDateText(
            foundLeanFiForecast.date,
            birthdate
          )
        : null;
    }
  }
}
