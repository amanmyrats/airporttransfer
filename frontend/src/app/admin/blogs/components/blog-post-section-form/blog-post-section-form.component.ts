import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogSection } from '../../models/blog-section.model';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { HttpErrorPrinterService } from '../../../../services/http-error-printer.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BlogPostSectionService } from '../../services/blog-post-section.service';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from "primeng/message";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-post-section-form',
  imports: [
    DropdownModule,
    FormsModule, ReactiveFormsModule, ButtonModule,
    InputNumber, MessagesModule,
    MessageModule, CommonModule, 
],
  providers: [
      HttpErrorPrinterService,
  ],
  templateUrl: './blog-post-section-form.component.html',
  styleUrl: './blog-post-section-form.component.scss'
})
export class BlogPostSectionFormComponent implements OnInit {
  // @Input() section: BlogSection | null = null;
  // @Output() save = new EventEmitter<BlogSection>();
  section: BlogSection | null = null;
  postId!: number;

  form: FormGroup;

  sectionTypes = [
    { label: 'Text Only', value: 'text' },
    { label: 'Image', value: 'image' },
    { label: 'Gallery', value: 'gallery' },
    { label: 'FAQs', value: 'faqs' },
    { label: 'Booking Form Embed', value: 'booking_form' },
  ];

  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private httpErrorPrinter = inject(HttpErrorPrinterService);
  private blogPostSectionService = inject(BlogPostSectionService);


  constructor() {
    this.form = this.fb.group({
      id: '',
      post: '',
      order: [0, Validators.required],
      section_type: ['text', Validators.required],
    });
  }

  ngOnInit(): void {
    this.section = this.config.data?.blogPostSection || null;
    this.postId = this.config.data?.postId || null;
    console.log('BlogPostSectionFormComponent initialized with section:', this.section, 'and postId:', this.postId);

    if (this.section) {
      this.form.patchValue({
        id: this.section.id,
        order: this.section.order ?? 0,
        section_type: this.section.section_type ?? 'text',
      });
    }
    this.form.patchValue({ post: this.postId });
    this.getBlogPostSectionTypes();
  } 

  onSubmit(): void {
    console.log('Form submitted with value:', this.form.value);
    if (this.form.valid) {
      if (this.section) {
        // Update existing section
        this.blogPostSectionService.update(this.section.id!, this.form.value).subscribe({
          next: (response) => {
            console.log('Section updated successfully:', response);
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error updating section:', error);
            this.httpErrorPrinter.printHttpError(error);
          }
        });
      } else {
          // Create new section
          this.blogPostSectionService.create(this.form.value).subscribe({
            next: (response) => {
              console.log('Section saved successfully:', response);
              this.dialogRef.close(response);
            },
            error: (error) => {
              console.error('Error saving section:', error);
              this.httpErrorPrinter.printHttpError(error);
            }
          });
      }
    }
  }

  getBlogPostSectionTypes() {
    // load choices first
    this.blogPostSectionService.getSectionTypes().subscribe({
      next: types => {
        this.sectionTypes = types;

        // now patch values (so dropdown has matching option)
        this.form.patchValue({
          post: this.postId,
          id: this.section?.id || '',
          order: this.section?.order ?? 0,
          section_type: this.section?.section_type ?? types[0]?.value ?? null,
        });
      },
      error: err => this.httpErrorPrinter.printHttpError(err),
    });

  }
}
