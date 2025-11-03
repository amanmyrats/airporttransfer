import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload-receipt',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './upload-receipt.component.html',
  styleUrls: ['./upload-receipt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadReceiptComponent {
  @Output() submitted = new EventEmitter<{ file: File; note?: string | null }>();

  form: FormGroup;
  file: File | null = null;
  isSubmitting = false;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      note: [''],
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.file = (input.files && input.files.length ? input.files[0] : null);
  }

  async submit() {
    if (!this.file || this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    this.submitted.emit({ file: this.file, note: this.form.value.note });
    this.isSubmitting = false;
    this.form.reset();
    this.file = null;
  }
}

