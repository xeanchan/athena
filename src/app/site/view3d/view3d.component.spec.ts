import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { View3dComponent } from './view3d.component';

describe('View3dComponent', () => {
  let component: View3dComponent;
  let fixture: ComponentFixture<View3dComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ View3dComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(View3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
