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
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { FaqItemService } from '../../services/faq-item.service';
import { FaqItem } from '../../models/faq-item.model';


@Component({
  selector: 'app-faq-item-form',
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
  templateUrl: './faq-item-form.component.html',
  styleUrl: './faq-item-form.component.scss'
})
export class FaqItemFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private faqService = inject(FaqItemService);
  private httpErrorPrinter = inject(HttpErrorPrinterService);
  private message = inject(MessageService);

  form!: FormGroup;

  // passed in by the opener
  faqItem: FaqItem | null = null;
  sectionId: number | null = null;

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null as number | null],
      section: [null as number | null, [Validators.required]],

      order: [0, [Validators.required, Validators.min(0)]],
      internal_note: [''],
      is_expanded_by_default: [false],
      anchor: ['', [Validators.maxLength(120), this.slugValidator]],
      is_featured: [false],
    });

    this.faqItem = this.config.data?.faqItem ?? null;
    this.sectionId = this.config.data?.sectionId ?? null;

    if (this.faqItem) {
      // editing: patch existing data
      this.form.patchValue({
        id: this.faqItem.id,
        section: Number(this.faqItem.section),
        order: Number(this.faqItem.order ?? 0),
        internal_note: this.faqItem.internal_note ?? '',
        is_expanded_by_default: !!this.faqItem.is_expanded_by_default,
        anchor: this.faqItem.anchor ?? '',
        is_featured: !!this.faqItem.is_featured,
      });
    } else {
      // creating: section is required
      if (this.sectionId != null) this.form.patchValue({ section: this.sectionId });
    }
  }

  // simple slug validator (letters, numbers, hyphen)
  private slugValidator = (c: any) => {
    const v: string = c.value ?? '';
    if (!v) return null;
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) ? null : { slug: true };
  };

  // optional: auto-slugify typed value on blur
  onAnchorBlur(): void {
    const v = (this.form.get('anchor')?.value ?? '') as string;
    if (!v) return;
    const slug = v
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    this.form.get('anchor')?.setValue(slug);
  }

  submit(): void {
    this.form.markAllAsTouched();

    if (!this.form.valid) {
      this.httpErrorPrinter.printFormErrors(this.form, {
        section: 'Section',
        order: 'Order',
        internal_note: 'Internal note',
        anchor: 'Anchor',
      });
      return;
    }

    const raw = this.form.getRawValue();

    const payload: Partial<FaqItem> = {
      section: String(raw.section),
      order: String(raw.order ?? 0),
      internal_note: raw.internal_note ?? '',
      is_expanded_by_default: String(!!raw.is_expanded_by_default),
      anchor: raw.anchor ?? '',
      is_featured: String(!!raw.is_featured),
    };

    if (this.faqItem?.id != null) {
      // UPDATE
      this.faqService.update(Number(this.faqItem.id), payload).subscribe({
        next: (updated) => {
          this.message.add({ severity: 'success', summary: 'Updated', detail: 'FAQ item updated successfully' });
          this.dialogRef.close(updated);
        },
        error: (err) => {
          this.httpErrorPrinter.printHttpError(err);
        }
      });
      return;
    }

    // CREATE
    this.faqService.create(payload).subscribe({
      next: (created) => {
        this.message.add({ severity: 'success', summary: 'Created', detail: 'FAQ item created successfully' });
        this.dialogRef.close(created);
      },
      error: (err) => {
        this.httpErrorPrinter.printHttpError(err);
      }
    });
  }

  get f() { return this.form.controls; }
}
