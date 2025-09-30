import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { RouterModule } from '@angular/router';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { BlogTagService } from '../../services/blog-tag.service';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { BlogTag } from '../../models/blog-tag.model';

@Component({
  selector: 'app-blog-tag-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    RouterModule,
    MessageModule,
    ToastModule,
  ],
  providers: [HttpErrorPrinterService],
  templateUrl: './blog-tag-form.component.html',
  styleUrl: './blog-tag-form.component.scss',
})
export class BlogTagFormComponent implements OnInit {
  form!: FormGroup;
  tag: BlogTag | null = null;

  constructor(
    private fb: FormBuilder,
    private tagService: BlogTagService,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private httpErrorPrinter: HttpErrorPrinterService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      slug: [''], // keep optional if backend can autogenerate; add Validators.required if you want to force it
    });

    this.tag = this.config?.data?.tag ?? null;
    if (this.tag) {
      this.form.patchValue(this.tag);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: BlogTag = this.form.value;

    if (this.tag?.id) {
      // Update
      this.tagService.update(this.tag.id as any, payload).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    } else {
      // Create
      this.tagService.create(payload).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    }
  }

  get f() {
    return this.form.controls;
  }
}
