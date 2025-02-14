import { Component, OnInit } from '@angular/core';

import { CalculateInput } from './models/calculate-input.model';

@Component({
    selector: 'app-forecasting',
    templateUrl: 'forecasting.component.html',
    standalone: false
})

export class ForecastingComponent implements OnInit {
  calculateInput: CalculateInput;
  constructor() {

  }

  ngOnInit() { }

  onCalculateInputChange($event) {
    this.calculateInput = $event;
  }
}
