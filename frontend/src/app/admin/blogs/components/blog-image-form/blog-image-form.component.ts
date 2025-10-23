import { BlogImageService } from '../../services/blog-image.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadModule } from 'primeng/fileupload';
import { RouterModule } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { ToastModule } from "primeng/toast";
import { BlogImage } from '../../models/blog-image.model';
import { HttpErrorPrinterService } from '../../../../services/http-error-printer.service';

@Component({
  selector: 'app-blog-image-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    TextareaModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    MultiSelectModule,
    FileUploadModule,
    RouterModule,
    SelectModule,
    MessageModule,
    ToastModule, 
  ],
  providers: [
      HttpErrorPrinterService, MessageService, 
  ],
  templateUrl: './blog-image-form.component.html',
  styleUrl: './blog-image-form.component.scss'
})
export class BlogImageFormComponent implements OnInit {
  form!: FormGroup;

  blogImage: BlogImage | null = null;

  constructor(
    private fb: FormBuilder, 
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private httpErrorPrinter: HttpErrorPrinterService, 
    private blogImageService: BlogImageService,
  ) {}

  ngOnInit(): void {
    
    this.form = this.fb.group({
      id: [null],
      section: [null], 
      
      is_primary: [""], 
      width: [""], 
      height: [""], 
      // mime_type: [""], 
      // bytes: [""], 
      focal_x: [""], 
      focal_y: [""], 
      dominant_color: [""], 
      blurhash: [""], 
    });

    this.blogImage = this.config.data?.blogImage || null;
    if (this.blogImage) {
      console.log('Editing blog image:', this.blogImage);
      this.form.patchValue(this.blogImage);
      }
    }

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.valid) {
      console.log('Form Data:', this.form.value);
      
        if (this.blogImage) {
          // Update existing blog image
          this.blogImageService.update(this.blogImage.id!, this.form.value).subscribe({
            next: (response) => {
              console.log('Blog Image updated successfully:', response);
              // Optionally reset the form or navigate to another page
              this.form.reset();
              this.dialogRef.close(response);
            },
            error: (error) => {
              console.error('Error updating blog image:', error);
              // Handle error, show message, etc.
              this.httpErrorPrinter.printHttpError(error);
            }
          });
          return;
        }
      } 
    else {
      console.log('Form is invalid');
      console.log(this.form.errors);
      this.form.markAllAsTouched();

      this.httpErrorPrinter.printFormErrors(this.form, {
        internal_title: 'Internal Title',
        slug: 'Slug',
        priority: 'Priority',
        // add labels for any controls you want pretty names for
      });
    }
  }

  get f() {
    return this.form.controls;
  }


}
