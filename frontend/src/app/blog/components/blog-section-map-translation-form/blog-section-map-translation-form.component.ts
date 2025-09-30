// blog-section-map-translation-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { BlogSectionMapTranslation } from '../../models/blog-section-map-translation.model';
import { BlogSectionMapTranslationService } from '../../services/blog-section-map-translation.service';

@Component({
  selector: 'app-blog-section-map-translation-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    SelectModule,
    MessageModule,
    ToastModule,
  ],
  providers: [HttpErrorPrinterService, MessageService],
  templateUrl: './blog-section-map-translation-form.component.html',
  styleUrl: './blog-section-map-translation-form.component.scss'
})
export class BlogSectionMapTranslationFormComponent implements OnInit {
  translation: BlogSectionMapTranslation | null = null;
  sectionMapId: string | number | null = null;
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
  private txService = inject(BlogSectionMapTranslationService);

  ngOnInit(): void {
    this.translation = this.config.data?.translation ?? null;
    this.sectionMapId = this.config.data?.sectionMapId ?? null;
    console.log('Editing translation:', this.translation, 'for map ID:', this.sectionMapId);
    console.log(this.config.data);
    this.form = this.fb.group({
      id: [this.translation?.id ?? null],
      section_map: [this.translation?.section_map ?? this.sectionMapId ?? null, [Validators.required]],
      language: [this.translation?.language ?? null, [Validators.required]],
      embed_url: [
        this.translation?.embed_url ?? '',
        [
          Validators.required,
          // keep this lenient—just ensure http(s). Tweak if you want stricter My Maps patterns.
          Validators.pattern(/^https?:\/\/.+/i),
        ]
      ],
    });

    // When editing an existing translation, lock the language control
    // if (this.translation?.id) {
    //   this.form.get('language')?.disable({ emitEvent: false });
    // }
  }

  get f() { return this.form.controls; }

  submit(): void {
    // If language is disabled (edit mode), include its value in payload
    // if (this.form.get('language')?.disabled) {
    //   this.form.get('language')?.enable({ emitEvent: false });
    // }

    this.form.markAllAsTouched();
    if (!this.form.valid) {
      this.httpErrorPrinter.printFormErrors(this.form, {
        section_map: 'Section Map',
        language: 'Language',
        embed_url: 'Embed URL',
      });
      return;
    }

    const payload = this.form.value as Partial<BlogSectionMapTranslation>;
    console.log('Submitting payload:', payload);
    if (this.translation?.id) {
      this.txService.update(this.translation.id, payload).subscribe({
        next: (res) => {
          this.msg.add({ severity: 'success', summary: 'Saved', detail: 'Map translation updated.' });
          this.dialogRef.close(res);
        },
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    } else {
      this.txService.create(payload).subscribe({
        next: (res) => {
          this.msg.add({ severity: 'success', summary: 'Created', detail: 'Map translation created.' });
          this.dialogRef.close(res);
        },
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    }
  }
}
