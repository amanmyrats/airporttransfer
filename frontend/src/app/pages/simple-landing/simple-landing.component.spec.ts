import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleLandingComponent } from './simple-landing.component';

describe('SimpleLandingComponent', () => {
  let component: SimpleLandingComponent;
  let fixture: ComponentFixture<SimpleLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleLandingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
