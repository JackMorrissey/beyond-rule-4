import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestonesComponent } from './milestones.component';

describe('MilestonesComponent', () => {
  let component: MilestonesComponent;
  let fixture: ComponentFixture<MilestonesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MilestonesComponent ]
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
