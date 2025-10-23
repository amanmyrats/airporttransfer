import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { BlogPostTranslationService } from '../../services/blog-post-translation.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BlogPostTranslation } from '../../models/blog-post-translation.model';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { HttpErrorPrinterService } from '../../../../services/http-error-printer.service';

@Component({
  selector: 'app-blog-post-translation-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    ButtonModule,
    RouterModule, 
    MessageModule, 
    ToastModule, 
  ],
  providers: [
      HttpErrorPrinterService,
  ],
  templateUrl: './blog-post-translation-form.component.html',
  styleUrl: './blog-post-translation-form.component.scss'
})
export class BlogPostTranslationFormComponent implements OnInit {
  @Input() languages = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'German' },
    { code: 'ru', label: 'Russian' },
    { code: 'tr', label: 'Turkish' }
  ];

  form!: FormGroup;
  blogPostId: string | null = null;
  blogPostTranslation: BlogPostTranslation | null = null;

  constructor(
    private fb: FormBuilder, 
    private blogPostTranslationService: BlogPostTranslationService, 
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private httpErrorPrinter: HttpErrorPrinterService, 
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      post: [null, Validators.required],
      language: [null, Validators.required],
      title: ['', Validators.required],
      short_description: [''],
      slug: ['', Validators.required],
      seo_title: [''],
      seo_description: ['']
    });

    
    this.blogPostTranslation = this.config.data.blogPostTranslation;
    if (this.blogPostTranslation) {
      this.form.patchValue(this.blogPostTranslation);
    }
    this.blogPostId = this.config.data.blogPostId;
    if (this.blogPostId) {
      this.form.patchValue({post: this.blogPostId});
    }
  }

  submit(): void {
    console.log('Form value:', this.form.value);
    if (this.form.valid) {
      const translationData = this.form.value;
      if (this.blogPostTranslation) {
        console.log('Updating existing translation:', this.blogPostTranslation.id);
        // Update existing translation
        this.blogPostTranslationService.update(this.blogPostTranslation.id!, translationData).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            this.httpErrorPrinter.printHttpError(error);
          }
        });
      } else {
        // Create new translation
        console.log('Creating new translation');
        this.blogPostTranslationService.create(translationData).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            this.httpErrorPrinter.printHttpError(error);
          }
        });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  get f() {
    return this.form.controls;
  }
}
