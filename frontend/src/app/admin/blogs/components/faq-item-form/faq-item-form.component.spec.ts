import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqItemFormComponent } from './faq-item-form.component';

describe('FaqItemFormComponent', () => {
  let component: FaqItemFormComponent;
  let fixture: ComponentFixture<FaqItemFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqItemFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
