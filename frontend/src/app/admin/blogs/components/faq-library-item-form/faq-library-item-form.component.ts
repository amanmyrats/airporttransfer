import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { HttpErrorPrinterService } from '../../../../services/http-error-printer.service';
import { FaqLibraryItemService } from '../../services/faq-library-item.service';
import { FaqLibraryItem } from '../../models/faq-library-item.model';

@Component({
  selector: 'app-faq-library-item-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    ToastModule,
    MessageModule,
  ],
  providers: [HttpErrorPrinterService, MessageService],
  templateUrl: './faq-library-item-form.component.html',
  styleUrl: './faq-library-item-form.component.scss'
})
export class FaqLibraryItemFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private faqLibService = inject(FaqLibraryItemService);
  private httpErrorPrinter = inject(HttpErrorPrinterService);
  private message = inject(MessageService);

  form!: FormGroup;

  // passed in by the opener
  item: FaqLibraryItem | null = null;

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null as number | null],
      internal_identifier: ['', [Validators.required, Validators.maxLength(120)]],
      key: ['', [Validators.maxLength(120), this.slugValidator]],   // optional; backend auto-generates if empty
      order: [0, [Validators.required, Validators.min(0)]],
      is_expanded_by_default: [false],
      is_featured: [false],
      slug_lock: [false],
    });

    this.item = this.config.data?.faqItem ?? null;

    if (this.item) {
      this.form.patchValue({
        id: this.item.id,
        internal_identifier: this.item.internal_identifier ?? '',
        key: this.item.key ?? '',
        order: Number(this.item.order ?? 0),
        is_expanded_by_default: !!this.item.is_expanded_by_default,
        is_featured: !!this.item.is_featured,
        slug_lock: !!this.item.slug_lock,
      });
    }
  }

  // simple slug validator (letters, numbers, hyphen)
  private slugValidator = (c: any) => {
    const v: string = c.value ?? '';
    if (!v) return null; // empty allowed (backend will auto-generate)
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) ? null : { slug: true };
  };

  // optional: auto-slugify on blur (uses current input; if empty, tries from internal_identifier)
  onKeyBlur(): void {
    const keyCtrl = this.form.get('key');
    const idCtrl = this.form.get('internal_identifier');
    const curr = (keyCtrl?.value ?? '') as string;
    if (curr) {
      keyCtrl?.setValue(this.slugify(curr));
      return;
    }
    const fromName = (idCtrl?.value ?? '') as string;
    if (fromName) {
      keyCtrl?.setValue(this.slugify(fromName));
    }
  }

  private slugify(v: string): string {
    return v
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  submit(): void {
    this.form.markAllAsTouched();

    if (!this.form.valid) {
      this.httpErrorPrinter.printFormErrors(this.form, {
        internal_identifier: 'Internal Identifier',
        key: 'Key (slug)',
        order: 'Order',
      });
      return;
    }

    const raw = this.form.getRawValue();
    const payload: Partial<FaqLibraryItem> = {
      internal_identifier: raw.internal_identifier ?? 'New FAQ',
      key: raw.key ? String(raw.key) : '', // allow empty; backend will fallback
      order: raw.order ?? 0,
      is_expanded_by_default: String(!!raw.is_expanded_by_default),
      is_featured: String(!!raw.is_featured),
      slug_lock: !!raw.slug_lock,
    };

    if (this.item?.id != null) {
      // UPDATE
      this.faqLibService.update(Number(this.item.id), payload).subscribe({
        next: (updated) => {
          this.message.add({ severity: 'success', summary: 'Updated', detail: 'FAQ library item updated successfully' });
          this.dialogRef.close(updated);
        },
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
      return;
    }

    // CREATE
    this.faqLibService.create(payload).subscribe({
      next: (created) => {
        this.message.add({ severity: 'success', summary: 'Created', detail: 'FAQ library item created successfully' });
        this.dialogRef.close(created);
      },
      error: (err) => this.httpErrorPrinter.printHttpError(err),
    });
  }

  get f() { return this.form.controls; }
}
