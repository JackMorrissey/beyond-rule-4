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

  }

  ngOnInit() {
    this.calculateInputChange.emit(this.calculateInput);
  }

  onCalculateInputChange($event) {
    this.calculateInput = $event;
    this.calculateInputChange.emit($event);
  }
}
