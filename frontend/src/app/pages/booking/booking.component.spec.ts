import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { BookingComponent } from './booking.component';
import { LanguageService } from '../../services/language.service';
import { GoogleMapsLoaderService } from '../../services/google-maps-loader.service';
import { SUPPORTED_LANGUAGES } from '../../constants/language.contants';

const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0]!;

class LanguageServiceStub {
  currentLang = signal<any>({ ...DEFAULT_LANGUAGE });
  getLanguageByCode(code: string) {
    return SUPPORTED_LANGUAGES.find((lang) => lang.code === code) ?? DEFAULT_LANGUAGE;
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
              data: { language: DEFAULT_LANGUAGE.code },
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
