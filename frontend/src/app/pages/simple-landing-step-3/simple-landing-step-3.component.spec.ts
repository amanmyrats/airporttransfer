import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleLandingStep3Component } from './simple-landing-step-3.component';

describe('SimpleLandingStep3Component', () => {
  let component: SimpleLandingStep3Component;
  let fixture: ComponentFixture<SimpleLandingStep3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleLandingStep3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleLandingStep3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
