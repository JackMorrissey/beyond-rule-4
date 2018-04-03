import { Component, OnInit, ViewEncapsulation, Input, OnChanges, SimpleChanges } from '@angular/core';
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

  @Input() netWorth;
  @Input() annualExpenses;


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
    if (!this.annualExpenses || !this.netWorth) {
      return;
    }
    this.data = [
      {
        key: 'Cumulative Return',
        values: [
          {
            'label' : 'FU$ (2.5x)' ,
            'value' : this.annualExpenses * 2.5
          } ,
          {
            'label' : 'Half FI' ,
            'value' : this.annualExpenses * 12.5
          } ,
          {
            'label' : 'Lean FI' ,
            'value' : this.annualExpenses * 0.7 * 25
          } ,
          {
            'label' : 'Flex FI' ,
            'value' : this.annualExpenses * 20
          } ,
          {
            'label' : 'FI' ,
            'value' : this.annualExpenses * 25
          } ,
          {
            'label' : 'Fat FI' ,
            'value' : this.annualExpenses * 30
          }
        ]
      }
    ];
  }

}
