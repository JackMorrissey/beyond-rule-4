import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

import { CalculateInput } from '../../models/calculate-input.model';
import { Forecast } from '../../models/forecast.model';
import { Milestones } from './milestone.model';

@Component({
  selector: 'app-milestones',
  templateUrl: './milestones.component.html',
  styleUrls: ['./milestones.component.css']
})
export class MilestonesComponent implements OnInit, OnChanges {

  @Input() calculateInput: CalculateInput;
  @Input() forecast: Forecast;
  milestones: Milestones;

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.calculateInput && changes.calculateInput.currentValue) {
      this.calculate();
    }
  }

  calculate() {
    const eclipseForecast = this.forecast.monthlyForecasts.find(m => {
      return m.totalContributions <= m.totalReturns;
    });
    if (!eclipseForecast) {
      this.milestones = new Milestones(this.calculateInput.fiNumber, this.calculateInput.leanFiNumber, 0);
      return;
    }

    const eclipseMarker = Math.min(eclipseForecast.totalContributions, eclipseForecast.totalReturns);
    this.milestones = new Milestones(this.calculateInput.fiNumber, this.calculateInput.leanFiNumber, eclipseMarker * 2);
  }
}
