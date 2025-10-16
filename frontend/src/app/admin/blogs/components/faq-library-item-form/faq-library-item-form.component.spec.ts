import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqLibraryItemFormComponent } from './faq-library-item-form.component';

describe('FaqLibraryItemFormComponent', () => {
  let component: FaqLibraryItemFormComponent;
  let fixture: ComponentFixture<FaqLibraryItemFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqLibraryItemFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqLibraryItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
