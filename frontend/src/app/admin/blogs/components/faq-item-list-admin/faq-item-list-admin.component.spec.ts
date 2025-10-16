import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqItemListAdminComponent } from './faq-item-list-admin.component';

describe('FaqItemListAdminComponent', () => {
  let component: FaqItemListAdminComponent;
  let fixture: ComponentFixture<FaqItemListAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqItemListAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqItemListAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
