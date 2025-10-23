// blog-video-translation-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HttpErrorPrinterService } from '../../../../services/http-error-printer.service';
import { BlogVideoTranslation } from '../../models/blog-video-translation.model';
import { BlogVideoTranslationService } from '../../services/blog-video-translation.service';


@Component({
  selector: 'app-blog-video-translation-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    DropdownModule,
    SelectModule,
    MessageModule,
    ToastModule,
  ],
  providers: [HttpErrorPrinterService, MessageService],
  templateUrl: './blog-video-translation-form.component.html',
  styleUrl: './blog-video-translation-form.component.scss'
})
export class BlogVideoTranslationFormComponent implements OnInit {
  translation: BlogVideoTranslation | null = null;
  videoId: string | null = null; // <- string, not number
  form!: FormGroup;

  languages = [
    { label: 'English', value: 'en' },
    { label: 'Deutsch', value: 'de' },
    { label: 'Русский', value: 'ru' },
    { label: 'Türkçe', value: 'tr' },
  ];

  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private httpErrorPrinter = inject(HttpErrorPrinterService);
  private msg = inject(MessageService);
  private txService = inject(BlogVideoTranslationService);

  
  ngOnInit(): void {
    this.translation = this.config.data?.translation ?? null;
    this.videoId = this.config.data?.videoId ?? null;

    this.form = this.fb.group({
      id: [this.translation?.id ?? null],
      // prefer translation.video if we’re editing, else dialog-provided videoId
      video: [this.translation?.video ?? this.videoId ?? null, [Validators.required]],
      language: [this.translation?.language ?? null, [Validators.required]],

      title: [this.translation?.title ?? '', [Validators.maxLength(255)]],
      caption: [this.translation?.caption ?? '', [Validators.maxLength(255)]],
      description: [this.translation?.description ?? ''],

      alt_text: [this.translation?.alt_text ?? '', [Validators.maxLength(255)]],
      aria_label: [this.translation?.aria_label ?? '', [Validators.maxLength(255)]],
      transcript: [this.translation?.transcript ?? ''],

      seo_title: [this.translation?.seo_title ?? '', [Validators.maxLength(255)]],
      seo_description: [this.translation?.seo_description ?? ''],
    });
  }
  
  get f() { return this.form.controls; }

  submit(): void {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      this.httpErrorPrinter.printFormErrors(this.form, {
        video: 'Video',
        language: 'Language',
        title: 'Title',
        caption: 'Caption',
        description: 'Description',
        alt_text: 'Alt text',
        aria_label: 'ARIA label',
        transcript: 'Transcript',
        seo_title: 'SEO title',
        seo_description: 'SEO description',
      });
      return;
    }

    const payload = this.form.value as Partial<BlogVideoTranslation>;

    if (this.translation?.id) {
      this.txService.update(this.translation.id, payload).subscribe({
        next: (res) => {
          this.msg.add({ severity: 'success', summary: 'Saved', detail: 'Video translation updated.' });
          this.dialogRef.close(res);
        },
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    } else {
      this.txService.create(payload).subscribe({
        next: (res) => {
          this.msg.add({ severity: 'success', summary: 'Created', detail: 'Video translation created.' });
          this.dialogRef.close(res);
        },
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    }
  }
}
