import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqItemTranslationFormComponent } from './faq-item-translation-form.component';

describe('FaqItemTranslationFormComponent', () => {
  let component: FaqItemTranslationFormComponent;
  let fixture: ComponentFixture<FaqItemTranslationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqItemTranslationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqItemTranslationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
