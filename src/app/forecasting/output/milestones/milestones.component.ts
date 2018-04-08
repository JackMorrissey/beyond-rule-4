import { Component, OnInit, Input } from '@angular/core';

import { round } from '../../utilities/number-utility';

import { CalculateInput } from '../../models/calculate-input.model';
import { Forecast, MonthlyForecast } from '../../models/forecast.model';
import { Milestones } from './milestone.model';

@Component({
  selector: 'app-milestones',
  templateUrl: './milestones.component.html',
  styleUrls: ['./milestones.component.css']
})
export class MilestonesComponent implements OnInit {

  @Input() calculateInput: CalculateInput;
  milestones: Milestones;
  forecast: Forecast;

  constructor() {
    const input = new CalculateInput();
    input.annualExpenses = 30000;
    input.annualSafeWithdrawalRate = 0.04;
    input.expectedAnnualGrowthRate = 0.08;
    input.leanFiPercentage = 0.7;
    input.netWorth = 300000;
    input.monthlyContribution = 3000;
    this.calculateInput = input;
  }

  ngOnInit() {
    this.calculate();
  }

  calculate() {
    const fiNumber = 1 / this.calculateInput.annualSafeWithdrawalRate * this.calculateInput.annualExpenses;
    this.milestones = new Milestones(fiNumber, this.calculateInput.leanFiPercentage);
    this.forecast = new Forecast(this.calculateInput);
  }
}
