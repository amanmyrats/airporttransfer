import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FaqItemTranslationService } from '../../services/faq-item-translation.service';
import { FaqItemTranslation } from '../../models/faq-item-translation.model';

@Component({
  selector: 'app-faq-item-translation-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './faq-item-translation-form.component.html',
  styleUrl: './faq-item-translation-form.component.scss'
})
export class FaqItemTranslationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private config = inject(DynamicDialogConfig);
  private dialogRef = inject(DynamicDialogRef);
  private txService = inject(FaqItemTranslationService);
  private message = inject(MessageService);

  form = this.fb.group({
    id: [null as number | null],
    item: [null as number | null, [Validators.required]],
    language: ['', [Validators.required]],
    question: ['', [Validators.required, Validators.maxLength(255)]],
    answer: ['', [Validators.required]],
    aria_label: [''],
    summary: [''],
  });

  translation: FaqItemTranslation | null = null;

  ngOnInit(): void {

    const faqItemId = this.config.data?.faqItemId as number | undefined;
    const preferredLanguage = (this.config.data?.preferredLanguage as string | undefined) ?? 'en';
    const translation = this.config.data?.translation as FaqItemTranslation | null;
    
    this.translation = translation ?? null;

    this.form.patchValue({
      id: Number(translation?.id ?? null),
      item: faqItemId ?? null,
      language: translation?.language ?? preferredLanguage,
      question: translation?.question ?? '',
      answer: translation?.answer ?? '',
      aria_label: translation?.aria_label ?? '',
      summary: translation?.summary ?? '',
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const val = this.form.getRawValue();
    const payload: Partial<FaqItemTranslation> = {
      item: String(val.item!),
      language: val.language!,
      question: val.question!,
      answer: val.answer!,
      aria_label: val.aria_label || '',
      summary: val.summary || '',
    };

    const req$ = val.id
      ? this.txService.update(val.id, payload as any)
      : this.txService.create(payload as any);

    req$.subscribe({
      next: saved => {
        this.message.add({ severity: 'success', summary: 'Saved', detail: 'FAQ translation saved' });
        this.dialogRef.close(saved);
      },
      error: () => this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to save translation' })
    });
  }
}
