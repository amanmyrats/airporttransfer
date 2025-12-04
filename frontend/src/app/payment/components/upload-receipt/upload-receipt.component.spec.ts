import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadReceiptComponent } from './upload-receipt.component';

describe('UploadReceiptComponent', () => {
  let component: UploadReceiptComponent;
  let fixture: ComponentFixture<UploadReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadReceiptComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emits submitted payload when form posted', () => {
    const file = new File(['test'], 'receipt.pdf', { type: 'application/pdf' });
    const fileInput: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fileInput.dispatchEvent(new Event('change'));

    component.form.patchValue({ note: 'Test note' });
    const spy = jasmine.createSpy('submitted');
    component.submitted.subscribe(spy);

    component.submit();
    expect(spy).toHaveBeenCalledOnceWith({ file, note: 'Test note' });
  });

  it('disables button when busy', () => {
    component.busy = true;
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();
  });

  it('renders success message when provided', () => {
    component.successMessage = 'Uploaded!';
    fixture.detectChanges();
    const message: HTMLElement = fixture.nativeElement.querySelector('.success');
    expect(message.textContent).toContain('Uploaded!');
  });
});
