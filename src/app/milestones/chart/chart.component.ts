import {
  Component, OnInit, ViewEncapsulation, Input, OnChanges, SimpleChanges,
  AfterContentInit, ElementRef, ViewChild
} from '@angular/core';
import { CalculateInput } from '../../models/calculate-input.model';
import { Forecast, MonthlyForecast } from '../../models/forecast.model';
import { Milestones } from '../milestone.model';

declare let d3: any;

@Component({
  selector: 'app-milestones-chart',
  templateUrl: './chart.component.html',
  styleUrls: [
    './chart.component.css'
  ],
  encapsulation: ViewEncapsulation.None
})
export class ChartComponent implements OnInit, AfterContentInit, OnChanges {
  @ViewChild('chartContainer') elementView: ElementRef;

  data: any[];

  view: any[];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Time';
  showYAxisLabel = true;
  yAxisLabel = 'Net Worth';
  referenceLines: any[];

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  // line, area
  autoScale = true;

  @Input() forecast: Forecast;
  @Input() milestones: Milestones;

  ngOnInit() {
    this.calculateData();
  }

  ngAfterContentInit () {
    this.view = [this.elementView.nativeElement.offsetWidth, this.elementView.nativeElement.offsetHeight];
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateData();
  }

  private calculateData() {
    if (!this.forecast || !this.milestones) {
      return;
    }

    const milestones = this.milestones.milestones.map((milestone => {
      return {
        name: milestone.label,
        value: milestone.value
      };
    }));

    const netWorth = this.forecast.monthlyForecasts.map((monthForecast) => {
      return {
        name: monthForecast.monthIndex,
        value: monthForecast.netWorth
      };
    });

    const contributions = this.forecast.monthlyForecasts.map((monthForecast) => {
      return {
        name: monthForecast.monthIndex,
        value: monthForecast.totalContributions
      };
    });

    const interest = this.forecast.monthlyForecasts.map((monthForecast) => {
      return {
        name: monthForecast.monthIndex,
        value: monthForecast.totalInterestGains
      };
    });

    this.data = [
      {
        name: 'Net Worth',
        series: netWorth
      },
      {
        name: 'Contributions',
        series: contributions
      },
      {
        name: 'Interest',
        series: interest
      }
    ];
    this.referenceLines = milestones;
  }

}
