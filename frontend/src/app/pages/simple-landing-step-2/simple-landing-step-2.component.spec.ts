import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleLandingStep2Component } from './simple-landing-step-2.component';

describe('SimpleLandingStep2Component', () => {
  let component: SimpleLandingStep2Component;
  let fixture: ComponentFixture<SimpleLandingStep2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleLandingStep2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleLandingStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
