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

import { BlogTagService } from '../../services/blog-tag.service';
import { BlogTag } from '../../models/blog-tag.model';
import { BlogTagTranslation } from '../../models/blog-tag-translation.model';
import { BlogTagTranslationFormComponent } from '../blog-tag-translation-form/blog-tag-translation-form.component';
import { SUPPORTED_LANGUAGES } from '../../../../constants/language.contants';
import { HttpErrorPrinterService } from '../../../../services/http-error-printer.service';

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
    TableModule,
  ],
  providers: [HttpErrorPrinterService, DialogService],
  templateUrl: './blog-tag-form.component.html',
  styleUrl: './blog-tag-form.component.scss',
})
export class BlogTagFormComponent implements OnInit {
  form!: FormGroup;
  tag: BlogTag | null = null;
  translations: BlogTagTranslation[] = [];
  languages = SUPPORTED_LANGUAGES;
  refTx?: DynamicDialogRef;

  constructor(
    private fb: FormBuilder,
    private tagService: BlogTagService,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private httpErrorPrinter: HttpErrorPrinterService,
    private dialogService: DialogService,
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
      this.translations = this.tag.translations ?? [];
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

  getTranslationForLang(lang?: string): BlogTagTranslation | null {
    if (!lang) return null;
    return this.translations.find(tx => tx.language === lang) ?? null;
  }

  openTranslationForm(language?: string, translation?: BlogTagTranslation | null): void {
    if (!this.tag?.id) {
      this.httpErrorPrinter.printHttpError({ error: { detail: 'Save the tag before adding translations.' } });
      return;
    }

    this.refTx = this.dialogService.open(BlogTagTranslationFormComponent, {
      header: translation ? `Edit ${translation.language?.toUpperCase()} Translation` : 'Add Translation',
      width: '520px',
      data: {
        tagId: this.tag.id,
        translation,
        preferredLanguage: translation?.language ?? language,
      },
      dismissableMask: true,
      closable: true,
      modal: true,
    });

    this.refTx.onClose.subscribe((res: BlogTagTranslation) => {
      if (!res) return;
      const txs = this.translations ?? [];
      const idx = txs.findIndex(t => t.language === res.language);
      if (idx !== -1) {
        txs[idx] = res;
      } else {
        txs.push(res);
      }
      this.translations = [...txs];
      if (res.language === 'en') {
        this.form.patchValue({ name: res.name, slug: res.slug });
      }
    });
  }
}
