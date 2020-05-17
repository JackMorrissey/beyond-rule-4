import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestonesComponent } from './milestones.component';

import { ChartComponent } from './chart/chart.component';
import { TextComponent } from './text/text.component';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('MilestonesComponent', () => {
  let component: MilestonesComponent;
  let fixture: ComponentFixture<MilestonesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MilestonesComponent, ChartComponent, TextComponent],
      imports: [NgxChartsModule, BrowserAnimationsModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MilestonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
