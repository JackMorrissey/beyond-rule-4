import { Component, OnInit, Input, OnChanges, SimpleChanges, } from '@angular/core';

import { CalculateInput } from '../../../models/calculate-input.model';
import { Forecast, MonthlyForecast } from '../../../models/forecast.model';
import { Milestones } from '../milestone.model';
import { birthdateToDate } from '../../../input/ynab/birthdate-utility';

@Component({
    selector: 'app-milestones-text',
    templateUrl: 'text.component.html',
    styleUrls: ['./text.component.css'],
    standalone: false
})

export class TextComponent implements OnInit, OnChanges {
  @Input() forecast: Forecast;
  @Input() milestones: Milestones;
  @Input() currencyIsoCode: string;

  milestonesWithForecast;

  private completeText = 'Achieved!';

  constructor() { }

  ngOnInit() {
    this.calculateData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateData();
  }

  calculateData() {
    if (!this.forecast || !this.milestones) {
      return;
    }
    const forecastSearch = this.forecast.monthlyForecasts;
    const milestonesSearch = this.milestones.milestones.sort((a, b) => {
      return a.value - b.value;
    });
    const foundForecasts = [];
    for (let i = 0; i < milestonesSearch.length; i++) {
      const milestone = milestonesSearch[i];
      const foundIndex = forecastSearch.findIndex(f => f.netWorth >= milestone.value);
      foundForecasts[i] = foundIndex;
    }
    this.milestonesWithForecast = milestonesSearch.map((milestone, i) => {
      const foundIndex = foundForecasts[i];
      if (foundIndex === -1) {
        return {
          milestone,
          forecast: null
        };
      }
      const forecast = forecastSearch[foundIndex];
      const forecastDate = this.getDateString(forecast.date);
      const distance = this.getDistanceText(forecast.date);
      const age = this.forecast.getDistanceFromDateText(forecast.date, birthdateToDate(this.forecast.birthdate));
      const completed = distance === this.completeText;
      return {
        milestone,
        forecast,
        forecastDate,
        distance,
        age,
        completed
      };
    });
  }

  getDateString(forecastDate: Date) {
    if (!forecastDate) {
      return 'N/A';
    }

    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
    return forecastDate.toLocaleDateString('en-US', options);
  }

  getDistanceText(forecastDate: Date) {
    return this.forecast.getDistanceFromFirstMonthText(forecastDate) ?? this.completeText;
  }

  getMilestoneTooltip(label: string): string {
    const tooltips: { [key: string]: string } = {
      'FU$': 'F-You Money: 10% of your FI number (2.5x annual expenses)',
      'Half FI': 'Halfway to Financial Independence (12.5x annual expenses)',
      'Lean FI': 'Financially independent with a lean budget',
      'Coast FI': 'The amount where investment growth alone reaches FI by your target retirement age',
      'Flex FI': 'Flexible FI: 80% of your FI number (20x annual expenses)',
      'FI': 'Financial Independence: 25x annual expenses using the 4% rule',
      'Fat FI': 'Fat FI: 120% of your FI number (30x annual expenses)',
      '1.5x FI': '1.5 times your FI number for extra security',
      'Contribution / Returns Eclipse': 'The point where investment returns exceed your contributions'
    };
    return tooltips[label] || '';
  }
}
