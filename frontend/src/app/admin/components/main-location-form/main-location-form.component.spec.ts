import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLocationFormComponent } from './main-location-form.component';

describe('MainLocationFormComponent', () => {
  let component: MainLocationFormComponent;
  let fixture: ComponentFixture<MainLocationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLocationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLocationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
