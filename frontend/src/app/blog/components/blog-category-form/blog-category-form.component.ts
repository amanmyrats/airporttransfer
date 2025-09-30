import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { RouterModule } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { BlogCategoryService } from '../../services/blog-category.service';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { BlogCategory } from '../../models/blog-category.model';


@Component({
  selector: 'app-blog-category-form',
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
  templateUrl: './blog-category-form.component.html',
  styleUrl: './blog-category-form.component.scss',
})
export class BlogCategoryFormComponent implements OnInit {
  form!: FormGroup;
  category: BlogCategory | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: BlogCategoryService,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private httpErrorPrinter: HttpErrorPrinterService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      slug: [''], // leave empty to auto-generate on backend
    });

    this.category = this.config?.data?.category ?? null;
    if (this.category) {
      this.form.patchValue(this.category);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: BlogCategory = this.form.value;

    if (this.category?.id) {
      // Update
      this.categoryService.update(this.category.id as any, payload).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    } else {
      // Create
      this.categoryService.create(payload).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    }
  }

  get f() {
    return this.form.controls;
  }
}
