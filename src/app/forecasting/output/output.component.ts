import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import { CalculateInput } from '../models/calculate-input.model';
import { Forecast } from '../models/forecast.model';

@Component({
    selector: 'app-forecasting-output',
    templateUrl: 'output.component.html',
    standalone: false
})

export class ForecastingOutputComponent implements OnInit, OnChanges {
  @Input() calculateInput: CalculateInput;
  forecast: Forecast;

  constructor() { }

  ngOnInit() {
    this.forecast = new Forecast(this.calculateInput);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.calculateInput) {
      this.forecast = new Forecast(this.calculateInput);
    }
  }
}
