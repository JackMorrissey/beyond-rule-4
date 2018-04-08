import { Component, OnInit } from '@angular/core';

import { round } from '../utilities/number-utility';

import { CalculateInput } from '../models/calculate-input.model';
import { Forecast, MonthlyForecast } from '../models/forecast.model';
import { Milestones } from './milestone.model';

@Component({
  selector: 'app-milestones',
  templateUrl: './milestones.component.html',
  styleUrls: ['./milestones.component.css']
})
export class MilestonesComponent implements OnInit {

  calculateInput: CalculateInput;
  milestones: Milestones;
  forecast: Forecast;

  constructor() {
    const input = new CalculateInput();
    input.annualExpenses = 25000;
    input.annualSafeWithdrawlRate = 0.03;
    input.expectedAnnualGrowthRate = 0.08;
    input.leanFiPercentage = 0.7;
    input.netWorth = 150000;
    input.monthlyContribution = 2000;
    this.calculateInput = input;
  }

  ngOnInit() {
    this.calculate();
  }

  calculate() {
    const fiNumber = 1 / this.calculateInput.annualSafeWithdrawlRate * this.calculateInput.annualExpenses;
    this.milestones = new Milestones(fiNumber, this.calculateInput.leanFiPercentage);
    const stopForecastingAmount = fiNumber * 1.2; // default to Fat FI.
    this.forecast = this.getForecast(stopForecastingAmount);
  }

  private getForecast(stopForecastingAmount: number): Forecast {
    const annualExpenses = this.calculateInput.annualExpenses;
    const monthlyAverageGrowth = 1 + this.calculateInput.expectedAnnualGrowthRate / 12;
    const startingNetWorth = this.calculateInput.netWorth;
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
    while (currentNetWorth < stopForecastingAmount && month < 500) {
      const contribution = this.calculateInput.monthlyContribution;
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
    return new Forecast({
      monthlyForecasts: monthlyForecasts
    });
  }

}
