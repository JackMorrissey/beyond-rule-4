import { Component, OnInit, Input, OnChanges, SimpleChanges,  } from '@angular/core';

import { Forecast } from '../../../models/forecast.model';
import { Milestones } from '../milestone.model';

@Component({
  selector: 'app-milestones-text',
  templateUrl: 'text.component.html'
})

export class TextComponent implements OnInit, OnChanges {
  @Input() forecast: Forecast;
  @Input() milestones: Milestones;

  milestonesWithForecast;


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
      const distance = this.getDistanceText(forecast.date, this.forecast.birthDate);
      return {
        milestone,
        forecast,
        forecastDate,
        distance
      };
    });
  }

  getDateString(forecastDate: Date) {
    if (!forecastDate) {
      return 'N/A';
    }

    const options = { year: 'numeric', month: 'short' };
    return forecastDate.toLocaleDateString('en-US', options);
  }

  getDistanceText(forecastDate: Date, birthDate: Date) {
    let text = this.forecast.getDistanceFromFirstMonthText(forecastDate);
    if (!text) {
      return 'Achieved!';
    }
    if (birthDate) {
      text += this.forecast.getAgeAtDistanceText(forecastDate, birthDate);
    }
    return text;
  }
}
