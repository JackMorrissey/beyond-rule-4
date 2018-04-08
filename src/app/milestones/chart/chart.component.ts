import { Component, OnInit, ViewEncapsulation, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CalculateInput } from '../../models/calculate-input.model';
import { Forecast, MonthlyForecast } from '../../models/forecast.model';
import { Milestones } from '../milestone.model';

declare let d3: any;

@Component({
  selector: 'app-milestones-chart',
  templateUrl: './chart.component.html',
  styleUrls: [
    '../../../../node_modules/nvd3/build/nv.d3.css',
    './chart.component.css'
  ],
  encapsulation: ViewEncapsulation.None
})
export class ChartComponent implements OnInit, OnChanges {

  options;
  data;

  @Input() forecast: Forecast;
  @Input() milestones: Milestones;


  constructor() { }

  ngOnInit() {
    this.options = {
      chart: {
        type: 'discreteBarChart',
        height: 450,
        margin : {
          top: 20,
          right: 20,
          bottom: 50,
          left: 55
        },
        x: function(d) {return d.label; },
        y: function(d) {return d.value; },
        showValues: true,
        valueFormat: function(d) {
          return d3.format('.4s')(d);
        },
        duration: 500,
        xAxis: {
          axisLabel: 'Time'
        },
        yAxis: {
          axisLabel: 'Portfolio Value',
          axisLabelDistance: -0
        }
      }
    };
    this.calculateData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateData();
  }

  private calculateData() {
    if (!this.forecast || !this.milestones) {
      return;
    }

    const values = this.milestones.milestones.map((milestone => {
      return {
        label: milestone.label,
        value: milestone.value
      };
    }));

    this.data = [
      {
        key: 'Cumulative Return',
        values: values
      }
    ];
  }

}
