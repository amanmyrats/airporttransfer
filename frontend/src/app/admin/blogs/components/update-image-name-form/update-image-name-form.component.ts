import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { HttpErrorPrinterService } from '../../../../services/http-error-printer.service';
import { BlogImageService } from '../../services/blog-image.service';

@Component({
  selector: 'app-update-image-name-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    ToastModule,
  ],
  providers: [HttpErrorPrinterService, MessageService],
  templateUrl: './update-image-name-form.component.html',
  styleUrl: './update-image-name-form.component.scss'
})
export class UpdateImageNameFormComponent implements OnInit {
  form!: FormGroup;

  imageId!: number;
  originalFileName = '';
  extension = '';
  isSaving = false;

  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private messageService = inject(MessageService);
  private httpErrorPrinter = inject(HttpErrorPrinterService);
  private blogImageService = inject(BlogImageService);

  ngOnInit(): void {
    this.imageId = this.config.data?.imageId;
    this.originalFileName = this.config.data?.fileName ?? '';
    this.extension = this.config.data?.extension ?? '';

    const suggestedName: string = this.config.data?.suggestedName ?? '';

    this.form = this.fb.group({
      new_name: [suggestedName, [Validators.required, Validators.maxLength(100)]],
    });
  }

  submit(): void {
    this.form.markAllAsTouched();

    if (!this.form.valid) {
      this.httpErrorPrinter.printFormErrors(this.form, {
        new_name: 'Image name',
      });
      return;
    }

    if (!this.imageId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Missing image identifier.' });
      return;
    }

    this.isSaving = true;
    const payload = this.form.value.new_name as string;

    this.blogImageService.changeImageName(this.imageId, payload).subscribe({
      next: (response) => {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Image name updated successfully.' });
        this.isSaving = false;
        this.dialogRef.close(response);
      },
      error: (err) => {
        this.isSaving = false;
        this.httpErrorPrinter.printHttpError(err);
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  get f() {
    return this.form.controls;
  }
}
