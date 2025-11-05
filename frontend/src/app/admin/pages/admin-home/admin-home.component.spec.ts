import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Meta } from '@angular/platform-browser';

import { AdminHomeComponent } from './admin-home.component';
import { AuthService } from '../../../auth/services/auth.service';
import { UserService } from '../../services/user.service';
import { ActiveRouteService } from '../../../services/active-route.service';
import { ReservationService } from '../../services/reservation.service';
import { ChangeRequestService } from '../../services/change-request.service';
import { ContactUsMessageService } from '../../services/contact-us-message.service';
import { ReviewsService } from '../../services/reviews.service';

describe('AdminHomeComponent', () => {
  let component: AdminHomeComponent;
  let fixture: ComponentFixture<AdminHomeComponent>;

  beforeEach(async () => {
    const reservationServiceMock = {
      listAdmin: jasmine.createSpy('listAdmin').and.returnValue(of({ count: 0, results: [] })),
    };
    const changeRequestServiceMock = {
      listAdmin: jasmine.createSpy('listAdmin').and.returnValue(of({ count: 0, results: [] })),
    };
    const contactUsMessageServiceMock = {
      getContactUsMessages: jasmine.createSpy('getContactUsMessages').and.returnValue(of({ count: 0, results: [] })),
    };
    const reviewsServiceMock = {
      listAdmin: jasmine.createSpy('listAdmin').and.returnValue(of({ count: 0, results: [] })),
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AdminHomeComponent],
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => true, logout: () => of(null) } },
        {
          provide: UserService,
          useValue: {
            initGetUserDetail: jasmine.createSpy('initGetUserDetail'),
            userDetailSignal: () => () => ({ first_name: 'Admin' }),
          },
        },
        { provide: ActiveRouteService, useValue: { activeRoute$: of('/admin') } },
        { provide: ReservationService, useValue: reservationServiceMock },
        { provide: ChangeRequestService, useValue: changeRequestServiceMock },
        { provide: ContactUsMessageService, useValue: contactUsMessageServiceMock },
        { provide: ReviewsService, useValue: reviewsServiceMock },
        { provide: Meta, useValue: { updateTag: () => {} } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
