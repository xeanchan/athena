import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPlanningComponent } from './new-planning.component';

describe('NewPlanningComponent', () => {
  let component: NewPlanningComponent;
  let fixture: ComponentFixture<NewPlanningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewPlanningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
