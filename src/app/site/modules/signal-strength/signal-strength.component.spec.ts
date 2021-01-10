import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalStrengthComponent } from './signal-strength.component';

describe('SignalStrengthComponent', () => {
  let component: SignalStrengthComponent;
  let fixture: ComponentFixture<SignalStrengthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignalStrengthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignalStrengthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
