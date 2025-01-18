import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingBannerFormComponent } from './booking-banner-form.component';

describe('BookingBannerFormComponent', () => {
  let component: BookingBannerFormComponent;
  let fixture: ComponentFixture<BookingBannerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingBannerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingBannerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
