import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingBannerFormPlaceholderComponent } from './booking-banner-form-placeholder.component';

describe('BookingBannerFormPlaceholderComponent', () => {
  let component: BookingBannerFormPlaceholderComponent;
  let fixture: ComponentFixture<BookingBannerFormPlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingBannerFormPlaceholderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingBannerFormPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
