import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SsrTestComponent } from './ssr-test.component';

describe('SsrTestComponent', () => {
  let component: SsrTestComponent;
  let fixture: ComponentFixture<SsrTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SsrTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SsrTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
