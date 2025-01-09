import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarTypeFormComponent } from './car-type-form.component';

describe('CarTypeFormComponent', () => {
  let component: CarTypeFormComponent;
  let fixture: ComponentFixture<CarTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarTypeFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CarTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
