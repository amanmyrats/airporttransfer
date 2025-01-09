import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLocationListComponent } from './main-location-list.component';

describe('MainLocationListComponent', () => {
  let component: MainLocationListComponent;
  let fixture: ComponentFixture<MainLocationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLocationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLocationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
