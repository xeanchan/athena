import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalCoverComponent } from './signal-cover.component';

describe('SignalCoverComponent', () => {
  let component: SignalCoverComponent;
  let fixture: ComponentFixture<SignalCoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignalCoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignalCoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
