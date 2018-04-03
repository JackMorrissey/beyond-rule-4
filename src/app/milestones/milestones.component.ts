import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-milestones',
  templateUrl: './milestones.component.html',
  styleUrls: ['./milestones.component.css']
})
export class MilestonesComponent implements OnInit {

  annualExpenses = 30000;
  netWorth = 150000;


  constructor() { }

  ngOnInit() {
  }

}
