import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { BookingComponent } from './booking.component';
import { LanguageService } from '../../services/language.service';
import { GoogleMapsLoaderService } from '../../services/google-maps-loader.service';

class LanguageServiceStub {
  currentLang = signal<any>({ code: 'en', name: 'English', flag: 'flags/gb.svg' });
  getLanguageByCode(code: string) {
    return { code, name: 'English', flag: 'flags/gb.svg' };
  }
}

class GoogleMapsLoaderServiceStub {
  state$ = of({ status: 'ready' });
}

describe('BookingComponent', () => {
  let component: BookingComponent;
  let fixture: ComponentFixture<BookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { language: 'en' },
            },
            queryParams: of({}),
            firstChild: null,
          },
        },
        { provide: LanguageService, useClass: LanguageServiceStub },
        { provide: GoogleMapsLoaderService, useClass: GoogleMapsLoaderServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
