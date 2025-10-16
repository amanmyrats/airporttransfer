import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqLibraryListComponent } from './faq-library-list.component';

describe('FaqLibraryListComponent', () => {
  let component: FaqLibraryListComponent;
  let fixture: ComponentFixture<FaqLibraryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqLibraryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqLibraryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
