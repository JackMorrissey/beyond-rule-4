import { Component, OnInit, Input } from '@angular/core';

import { CalculateInput } from '../models/calculate-input.model';

@Component({
  selector: 'app-forecasting-output',
  templateUrl: 'output.component.html'
})

export class ForecastingOutputComponent implements OnInit {
  @Input() calculateInput: CalculateInput;
  constructor() { }

  ngOnInit() { }
}
