import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RichTextWithTableComponent } from './rich-text-with-table.component';

describe('RichTextWithTableComponent', () => {
  let component: RichTextWithTableComponent;
  let fixture: ComponentFixture<RichTextWithTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RichTextWithTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RichTextWithTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
