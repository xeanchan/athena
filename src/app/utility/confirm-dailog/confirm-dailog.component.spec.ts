import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDailogComponent } from './confirm-dailog.component';

describe('ConfirmDailogComponent', () => {
  let component: ConfirmDailogComponent;
  let fixture: ComponentFixture<ConfirmDailogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmDailogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDailogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
