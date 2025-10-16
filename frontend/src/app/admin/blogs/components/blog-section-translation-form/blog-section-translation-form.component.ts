import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlogSectionTranslation } from '../../models/blog-section-translation.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { MessagesModule } from 'primeng/messages';
import { HttpErrorPrinterService } from '../../../../services/http-error-printer.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BlogPostSectionTranslationService } from '../../services/blog-post-section-translation.service';
import { BlogSection } from '../../models/blog-section.model';
import { RichTextWithTableComponent } from '../rich-text-with-table/rich-text-with-table.component';

@Component({
  selector: 'app-blog-section-translation-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    FileUploadModule, MessagesModule, 
    RichTextWithTableComponent, 
    ],
    providers: [
      HttpErrorPrinterService,
    ],
  templateUrl: './blog-section-translation-form.component.html',
  styleUrl: './blog-section-translation-form.component.scss'
})
export class BlogSectionTranslationFormComponent implements OnInit {

  blogSectionTranslation: BlogSectionTranslation | null = null;
  blogSection: BlogSection | null = null;
  language: string = '';

  form!: FormGroup;

  languages = [
    { label: 'EN', value: 'en' },
    { label: 'DE', value: 'de' },
    { label: 'RU', value: 'ru' },
    { label: 'TR', value: 'tr' }
  ];

  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private httpErrorPrinter = inject(HttpErrorPrinterService);
  private blogPostSectionTranslationService = inject(BlogPostSectionTranslationService);

  constructor() {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: '',
      section: '',
      language: '',
      heading: '',
      body: '',
    });

    this.blogSectionTranslation = this.config.data?.translation || null;
    this.blogSection = this.config.data?.section || null;
    this.language = this.config.data?.language || '';
    console.log('BlogSectionTranslationFormComponent initialized with translation:', this.blogSectionTranslation, 'language:', this.language);
    if (this.blogSectionTranslation) {
      this.form.patchValue({
        id: this.blogSectionTranslation.id!,
        section: this.blogSectionTranslation.section!,
        heading: this.blogSectionTranslation.heading,
        body: this.blogSectionTranslation.body,
      });
    }
    if (this.blogSection) {
      this.form.patchValue({
        section: this.blogSection.id!,
      });
    }
    if (this.language) {
      this.form.patchValue({
        language: this.language,
      });
    }

  }

  onSubmit(): void {
    console.log('Form submitted with value:', this.form.value);
    if (this.form.valid) {
      this.form.value.body = this.normalizeHtml(this.form.value.body);
      if (this.blogSectionTranslation) {
        this.blogPostSectionTranslationService.update(this.blogSectionTranslation.id!, this.form.value).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error updating translation:', error);
            this.httpErrorPrinter.printHttpError(error);
          }
        });
      } else {
        // Create new translation
        this.blogPostSectionTranslationService.create(this.form.value).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error saving translation:', error);
            this.httpErrorPrinter.printHttpError(error);
          }
        });
      }
    }
  }

  onFileSelect(event: any): void {
    const file = event.files?.[0];
    if (file) {
      this.form.patchValue({ og_image: file });
    }
  }
  private normalizeHtml(html: string): string {
    if (!html) return '';
    return html
      .replace(/\u00A0/g, ' ')     // NBSP char -> space
      .replace(/&nbsp;/g, ' ')     // HTML entity -> space
      .replace(/[ \t]{2,}/g, ' '); // optional: collapse multiple spaces
  }
}
