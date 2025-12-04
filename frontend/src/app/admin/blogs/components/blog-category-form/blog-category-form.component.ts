import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { RouterModule } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';

import { BlogCategoryService } from '../../services/blog-category.service';
import { BlogCategory } from '../../models/blog-category.model';
import { BlogCategoryTranslation } from '../../models/blog-category-translation.model';
import { BlogCategoryTranslationFormComponent } from '../blog-category-translation-form/blog-category-translation-form.component';
import { HttpErrorPrinterService } from '../../../../services/http-error-printer.service';
import { SUPPORTED_LANGUAGES } from '../../../../constants/language.contants';


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
    TableModule,
  ],
  providers: [HttpErrorPrinterService, DialogService],
  templateUrl: './blog-category-form.component.html',
  styleUrl: './blog-category-form.component.scss',
})
export class BlogCategoryFormComponent implements OnInit {
  form!: FormGroup;
  category: BlogCategory | null = null;
  translations: BlogCategoryTranslation[] = [];
  languages = SUPPORTED_LANGUAGES;
  refTx?: DynamicDialogRef;

  constructor(
    private fb: FormBuilder,
    private categoryService: BlogCategoryService,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private httpErrorPrinter: HttpErrorPrinterService,
    private dialogService: DialogService,
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
      this.translations = this.category.translations ?? [];
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

  getTranslationForLang(lang?: string): BlogCategoryTranslation | null {
    if (!lang) return null;
    return this.translations.find(tx => tx.language === lang) ?? null;
  }

  openTranslationForm(language?: string, translation?: BlogCategoryTranslation | null): void {
    if (!this.category?.id) {
      this.httpErrorPrinter.printHttpError({ error: { detail: 'Save the category before adding translations.' } });
      return;
    }

    this.refTx = this.dialogService.open(BlogCategoryTranslationFormComponent, {
      header: translation ? `Edit ${translation.language?.toUpperCase()} Translation` : 'Add Translation',
      width: '520px',
      data: {
        categoryId: this.category.id,
        translation,
        preferredLanguage: translation?.language ?? language,
      },
      dismissableMask: true,
      closable: true,
      modal: true,
    });

    this.refTx.onClose.subscribe((res: BlogCategoryTranslation) => {
      if (!res) return;
      const txs = this.translations ?? [];
      const idx = txs.findIndex(t => t.language === res.language);
      if (idx !== -1) {
        txs[idx] = res;
      } else {
        txs.push(res);
      }
      this.translations = [...txs];
      // if EN updated, mirror into base display
      if (res.language === 'en') {
        this.form.patchValue({ name: res.name, slug: res.slug });
      }
    });
  }
}
