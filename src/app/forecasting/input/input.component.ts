import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { CalculateInput } from '../models/calculate-input.model';

@Component({
  selector: 'app-forecasting-input',
  templateUrl: 'input.component.html'
})

export class ForecastingInputComponent implements OnInit {
  calculateInput: CalculateInput;
  @Output() calculateInputChange = new EventEmitter<CalculateInput>();

  constructor() {
    const input = new CalculateInput();
    input.annualExpenses = 30000;
    input.leanAnnualExpenses = 25000;
    input.leanFiPercentage = 0.7;
    input.netWorth = 50000;
    input.monthlyContribution = 1500;
    this.calculateInput = input;
  }

  ngOnInit() {
    this.calculateInputChange.emit(this.calculateInput);
  }

  onCalculateInputChange($event) {
    this.calculateInput = $event;
    this.calculateInputChange.emit($event);
  }
}
