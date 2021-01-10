import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalQualityComponent } from './signal-quality.component';

describe('SignalQualityComponent', () => {
  let component: SignalQualityComponent;
  let fixture: ComponentFixture<SignalQualityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignalQualityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignalQualityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
