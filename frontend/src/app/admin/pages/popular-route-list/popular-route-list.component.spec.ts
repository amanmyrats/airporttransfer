import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularRouteListComponent } from './popular-route-list.component';

describe('PopularRouteListComponent', () => {
  let component: PopularRouteListComponent;
  let fixture: ComponentFixture<PopularRouteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularRouteListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopularRouteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
