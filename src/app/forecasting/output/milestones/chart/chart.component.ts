import {
  Component, OnInit, ViewEncapsulation, Input, OnChanges, SimpleChanges,
  AfterContentInit, ElementRef, ViewChild, HostListener, Inject, LOCALE_ID
} from '@angular/core';

import { Forecast } from '../../../models/forecast.model';
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

  constructor(@Inject(LOCALE_ID) private locale: string) { }

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
  public yAxisTickFormattingFn = this.yAxisTickFormatting.bind(this);

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  // line, area
  autoScale = true;

  @Input() forecast: Forecast;
  @Input() milestones: Milestones;
  @Input() currencyIsoCode: string;

  private dateNow: Date;

  ngOnInit() {
    this.calculateData();
    this.dateNow = new Date();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setViewDimensions();
  }

  ngAfterContentInit() {
    this.setViewDimensions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateData();
  }

  onSelect($event) {

  }

  setViewDimensions() {
    this.view = [this.elementView.nativeElement.offsetWidth, this.elementView.nativeElement.offsetHeight];
  }

  getToolTipDate(tooltipItem: any) {
    const forecastDate: Date = tooltipItem.name;
    const options = { year: 'numeric', month: 'short' };
    const date = forecastDate.toLocaleDateString(this.locale, options);
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
      result += this.formatCurrency(tooltipItem.value);
    }
    return result;
  }

  yAxisTickFormatting(val: number): string {
    return this.formatCurrency(val);
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

    const returns = this.forecast.monthlyForecasts.map((monthForecast) => {
      return {
        name: monthForecast.date,
        value: monthForecast.totalReturns
      };
    });

    this.data = [
      {
        name: 'Portfolio',
        series: netWorth
      },
      {
        name: 'Contributions',
        series: contributions
      },
      {
        name: 'Returns',
        series: returns
      }
    ];
    this.referenceLines = milestones;
  }

  private formatCurrency(val: number): string {
    return Intl.NumberFormat(this.locale, { style: "currency", currency: this.currencyIsoCode }).format(val);
  }

}
