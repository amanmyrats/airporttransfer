import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { BlogCategoryTranslation } from '../../models/blog-category-translation.model';
import { BlogCategoryTranslationService } from '../../services/blog-category-translation.service';
import { HttpErrorPrinterService } from '../../../../services/http-error-printer.service';
import { SUPPORTED_LANGUAGES } from '../../../../constants/language.contants';

@Component({
  selector: 'app-blog-category-translation-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    MessageModule,
    ToastModule,
  ],
  providers: [HttpErrorPrinterService, MessageService],
  templateUrl: './blog-category-translation-form.component.html',
  styleUrl: './blog-category-translation-form.component.scss'
})
export class BlogCategoryTranslationFormComponent implements OnInit {
  form!: FormGroup;

  translation: BlogCategoryTranslation | null = null;
  categoryId: number | null = null;

  languages = SUPPORTED_LANGUAGES.map(({ code, name }) => ({ label: name, value: code }));

  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private httpErrorPrinter = inject(HttpErrorPrinterService);
  private msg = inject(MessageService);
  private txService = inject(BlogCategoryTranslationService);

  ngOnInit(): void {
    this.translation = this.config.data?.translation ?? null;
    this.categoryId = this.config.data?.categoryId ?? null;
    const preferredLanguage = this.config.data?.preferredLanguage ?? null;

    this.form = this.fb.group({
      id: [this.translation?.id ?? null],
      category: [this.translation?.category ?? this.categoryId, [Validators.required]],
      language: [this.translation?.language ?? preferredLanguage, [Validators.required]],
      name: [this.translation?.name ?? '', [Validators.required, Validators.maxLength(100)]],
      slug: [this.translation?.slug ?? '', [Validators.maxLength(150)]],
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      this.httpErrorPrinter.printFormErrors(this.form, {
        category: 'Category',
        language: 'Language',
        name: 'Name',
        slug: 'Slug',
      });
      return;
    }

    const payload = this.form.value as Partial<BlogCategoryTranslation>;
    if (this.translation?.id) {
        this.txService.update(this.translation.id, payload).subscribe({
        next: (res) => {
          this.msg.add({ severity: 'success', summary: 'Saved', detail: 'Category translation updated.' });
          this.dialogRef.close(res);
        },
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    } else {
      this.txService.create(payload).subscribe({
        next: (res) => {
          this.msg.add({ severity: 'success', summary: 'Created', detail: 'Category translation created.' });
          this.dialogRef.close(res);
        },
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    }
  }

  get f() {
    return this.form.controls;
  }
}
