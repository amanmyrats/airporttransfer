import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqSectionPublicComponent } from './faq-section-public.component';

describe('FaqSectionPublicComponent', () => {
  let component: FaqSectionPublicComponent;
  let fixture: ComponentFixture<FaqSectionPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqSectionPublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqSectionPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
