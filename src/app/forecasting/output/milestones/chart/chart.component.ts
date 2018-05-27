import {
  Component, OnInit, ViewEncapsulation, Input, OnChanges, SimpleChanges,
  AfterContentInit, ElementRef, ViewChild, HostListener
} from '@angular/core';
import { CalculateInput } from '../../../models/calculate-input.model';
import { Forecast, MonthlyForecast } from '../../../models/forecast.model';
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
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  timeline = false;
  xAxisLabel = 'Date';
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

  private dateNow: Date;

  ngOnInit() {
    this.calculateData();
    this.dateNow = new Date();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setViewDimensions();
  }

  ngAfterContentInit () {
    this.setViewDimensions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateData();
  }

  onSelect($event) {

  }

  setViewDimensions () {
    this.view = [this.elementView.nativeElement.offsetWidth, this.elementView.nativeElement.offsetHeight];
  }

  getToolTipDate(tooltipItem: any) {
    const forecastDate: Date = tooltipItem.name;
    const options = { year: 'numeric', month: 'short' };
    const date = forecastDate.toLocaleDateString('en-US', options);
    const distance = this.forecast.getDistanceFromFirstMonthText(forecastDate);
    if (!distance) {
      return date;
    }
    return `${date} • ${distance}`;
  }

  getToolTipText(tooltipItem: any): string {
    let result = '';
    if (tooltipItem.series !== undefined) {
      result += tooltipItem.series;
    } else {
      result += '???';
    }
    result += ': ';
    if (tooltipItem.value !== undefined) {
      result += tooltipItem.value.toLocaleString();
    }
    return result;
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
        name: monthForecast.date,
        value: monthForecast.netWorth
      };
    });

    const contributions = this.forecast.monthlyForecasts.map((monthForecast) => {
      return {
        name: monthForecast.date,
        value: monthForecast.totalContributions
      };
    });

    const interest = this.forecast.monthlyForecasts.map((monthForecast) => {
      return {
        name: monthForecast.date,
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
