import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { FaqLibraryItemTranslationService } from '../../services/faq-library-item-translation.service';
import { FaqLibraryItemTranslation } from '../../models/faq-library-item-translation.model';

type LangOption = { label: string; value: string };

@Component({
  selector: 'app-faq-library-item-translation-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    ToastModule,
    MessageModule,
  ],
  providers: [HttpErrorPrinterService, MessageService],
  templateUrl: './faq-library-item-translation-form.component.html',
  styleUrl: './faq-library-item-translation-form.component.scss'
})
export class FaqLibraryItemTranslationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private txService = inject(FaqLibraryItemTranslationService);
  private httpErrorPrinter = inject(HttpErrorPrinterService);
  private message = inject(MessageService);

  form!: FormGroup;

  // passed by opener
  faqItemId!: number; // required on create
  translation: FaqLibraryItemTranslation | null = null;
  preferredLanguage: string | null = null;

  languages: LangOption[] = [
    { label: 'English', value: 'en' },
    { label: 'Deutsch', value: 'de' },
    { label: 'Russian', value: 'ru' },
    { label: 'Turkish', value: 'tr' },
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null as number | null],
      item: [null as number | null, [Validators.required]],
      language: ['', [Validators.required, this.langValidator]],
      question: ['', [Validators.required, Validators.maxLength(255)]],
      answer: [''],
    });

    this.translation = this.config.data?.translation ?? null;
    this.faqItemId = Number(this.config.data?.faqItemId ?? null);
    this.preferredLanguage = this.config.data?.preferredLanguage ?? null;

    if (this.translation) {
      // Edit existing translation
      this.form.patchValue({
        id: this.translation.id,
        item: Number(this.translation.item),
        language: this.translation.language,
        question: this.translation.question ?? '',
        answer: this.translation.answer ?? '',
      });

      // Lock language on edit to avoid unique_together collisions
      this.form.get('language')?.disable({ emitEvent: false });
    } else {
      // Create new translation
      this.form.patchValue({
        item: this.faqItemId || null,
        language: (this.preferredLanguage || 'en').toLowerCase(),
      });
    }
  }

  private langValidator = (c: any) => {
    const v = (c?.value ?? '').toString().toLowerCase();
    if (!v) return { required: true };
    return ['en', 'de', 'ru', 'tr'].includes(v) ? null : { lang: true };
  };

  submit(): void {
    this.form.markAllAsTouched();

    if (!this.form.valid) {
      this.httpErrorPrinter.printFormErrors(this.form, {
        item: 'FAQ Library Item',
        language: 'Language',
        question: 'Question',
      });
      return;
    }

    // When language is disabled (edit), include its value from getRawValue
    const raw = this.form.getRawValue();

    const payload: Partial<FaqLibraryItemTranslation> = {
      item: String(raw.item),
      language: String(raw.language).toLowerCase(),
      question: raw.question ?? '',
      answer: raw.answer ?? '',
    };

    // Update
    if (this.translation?.id != null) {
      this.txService.update(Number(this.translation.id), payload).subscribe({
        next: (updated) => {
          this.message.add({ severity: 'success', summary: 'Updated', detail: 'Translation updated successfully' });
          this.dialogRef.close(updated);
        },
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
      return;
    }

    // Create
    this.txService.create(payload).subscribe({
      next: (created) => {
        this.message.add({ severity: 'success', summary: 'Created', detail: 'Translation created successfully' });
        this.dialogRef.close(created);
      },
      error: (err) => this.httpErrorPrinter.printHttpError(err),
    });
  }

  get f() { return this.form.controls; }
}
