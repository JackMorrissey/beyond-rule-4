import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import { round } from '../../utilities/number-utility';

import { CalculateInput } from '../../models/calculate-input.model';
import { Forecast, MonthlyForecast } from '../../models/forecast.model';
import { Milestones } from './milestone.model';

@Component({
  selector: 'app-milestones',
  templateUrl: './milestones.component.html',
  styleUrls: ['./milestones.component.css']
})
export class MilestonesComponent implements OnInit, OnChanges {

  @Input() calculateInput: CalculateInput;
  milestones: Milestones;
  forecast: Forecast;

  constructor() {
  }

  ngOnInit() {
    // this.calculate();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.calculateInput && changes.calculateInput.currentValue) {
      this.calculate();
    }
  }

  calculate() {
    const fiNumber = 1 / this.calculateInput.annualSafeWithdrawalRate * this.calculateInput.annualExpenses;
    this.milestones = new Milestones(fiNumber, this.calculateInput.leanFiPercentage);
    this.forecast = new Forecast(this.calculateInput);
  }
}
