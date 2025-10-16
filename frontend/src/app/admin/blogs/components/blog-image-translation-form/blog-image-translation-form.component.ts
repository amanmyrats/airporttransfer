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
import { BlogImageTranslation } from '../../models/blog-image-translation.model';
import { BlogImageTranslationService } from '../../services/blog-image-translation.service';

@Component({
  selector: 'app-blog-image-translation-form',
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
  templateUrl: './blog-image-translation-form.component.html',
  styleUrl: './blog-image-translation-form.component.scss'
})
export class BlogImageTranslationFormComponent implements OnInit {
  form!: FormGroup;

  // If editing existing translation
  translation: BlogImageTranslation | null = null;
  blogImageId: number | null = null;

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
  private imgTxService = inject(BlogImageTranslationService);

  ngOnInit(): void {
    // read data passed from the opener
    this.translation = this.config.data?.translation ?? null;
    this.blogImageId = this.config.data?.blogImageId ?? null;

    this.form = this.fb.group({
      id: [this.translation?.id ?? null],
      image: [this.blogImageId, [Validators.required]],
      language: [this.translation?.language ?? null, [Validators.required]],
      caption: [this.translation?.caption ?? '', [Validators.maxLength(255)]],
      alt_text: [this.translation?.alt_text ?? '', [Validators.maxLength(255)]],
      title_text: [this.translation?.title_text ?? '', [Validators.maxLength(255)]],
      aria_label: [this.translation?.aria_label ?? '', [Validators.maxLength(255)]],
      long_description: [this.translation?.long_description ?? ''],
      file_name_override: [this.translation?.file_name_override ?? '', [Validators.maxLength(200)]],
    });

    // // Ensure image FK is set if provided by the opener
    // if (this.imageId && !this.form.get('image')?.value) {
    //   this.form.patchValue({ image: this.imageId });
    // }
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      this.httpErrorPrinter.printFormErrors(this.form, {
        image: 'BlogImage',
        language: 'Language',
        caption: 'Caption',
        alt_text: 'Alt text',
        title_text: 'Title',
        aria_label: 'ARIA label',
        long_description: 'Long description',
        file_name_override: 'File name override',
      });
      return;
    }

    const payload = this.form.value as Partial<BlogImageTranslation>;
    // Coerce image id to a primitive number if needed
    // if (payload.image && typeof payload.image !== 'number') {
    //   payload.image = Number(payload.image) as any;
    // }
    console.log('translation: ', this.translation);
    if (this.translation?.id) {
      // Update
      console.log('Updating translation with payload:', payload);
      this.imgTxService.update(this.translation.id, payload).subscribe({
        next: (res) => {
          this.msg.add({ severity: 'success', summary: 'Saved', detail: 'Image translation updated.' });
          this.dialogRef.close(res);
        },
        error: (err) => {
          this.httpErrorPrinter.printHttpError(err);
        }
      });
    } else {
      // Create
      console.log('Creating translation with payload:', payload);
      this.imgTxService.create(payload).subscribe({
        next: (res) => {
          this.msg.add({ severity: 'success', summary: 'Created', detail: 'Image translation created.' });
          this.dialogRef.close(res);
        },
        error: (err) => {
          this.httpErrorPrinter.printHttpError(err);
        }
      });
    }
  }

  get f() {
    return this.form.controls;
  }
}
