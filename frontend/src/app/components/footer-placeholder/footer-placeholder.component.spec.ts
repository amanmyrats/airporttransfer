import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterPlaceholderComponent } from './footer-placeholder.component';

describe('FooterPlaceholderComponent', () => {
  let component: FooterPlaceholderComponent;
  let fixture: ComponentFixture<FooterPlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterPlaceholderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
