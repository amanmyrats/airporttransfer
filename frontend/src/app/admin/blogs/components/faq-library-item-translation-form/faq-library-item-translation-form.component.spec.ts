import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqLibraryItemTranslationFormComponent } from './faq-library-item-translation-form.component';

describe('FaqLibraryItemTranslationFormComponent', () => {
  let component: FaqLibraryItemTranslationFormComponent;
  let fixture: ComponentFixture<FaqLibraryItemTranslationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqLibraryItemTranslationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqLibraryItemTranslationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
