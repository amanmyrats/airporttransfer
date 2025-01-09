import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularRouteFormComponent } from './popular-route-form.component';

describe('PopularRouteFormComponent', () => {
  let component: PopularRouteFormComponent;
  let fixture: ComponentFixture<PopularRouteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularRouteFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopularRouteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
