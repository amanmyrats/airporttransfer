import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { BlogTag } from '../../models/blog-tag.model';
import { BlogTagService } from '../../services/blog-tag.service';
import { BlogTagFormComponent } from '../blog-tag-form/blog-tag-form.component';
import { BlogTagTranslationFormComponent } from '../blog-tag-translation-form/blog-tag-translation-form.component';
import { BlogTagTranslation } from '../../models/blog-tag-translation.model';
import { PaginatedResponse } from '../../../../models/paginated-response.model';
import { SUPPORTED_LANGUAGES } from '../../../../constants/language.contants';

@Component({
  selector: 'app-blog-tag-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [DialogService, ConfirmationService, MessageService],
  templateUrl: './blog-tag-list.component.html',
  styleUrl: './blog-tag-list.component.scss',
})
export class BlogTagListComponent implements OnInit {
  private dialog = inject(DialogService);
  private confirm = inject(ConfirmationService);
  private messages = inject(MessageService);
  tagService = inject(BlogTagService);

  tags: BlogTag[] = [];
  ref?: DynamicDialogRef;
  refTx?: DynamicDialogRef;
  languages = SUPPORTED_LANGUAGES;

  ngOnInit(): void {
    this.getTags();
  }

  getTags(): void {
    this.tagService.getAll().subscribe({
      next: (data: PaginatedResponse<BlogTag>) => (this.tags = data?.results! ?? data ?? []),
      error: (err) => this.messages.add({ severity: 'error', summary: 'Error', detail: 'Failed to load tags' }),
    });
  }

  openCreate(): void {
    this.ref = this.dialog.open(BlogTagFormComponent, {
      header: 'Create Tag',
      width: '460px',
      data: { tag: null },
      closable: true,
      dismissableMask: true,
      modal: true,
    });

    this.ref.onClose.subscribe((created) => {
      if (created) {
        this.messages.add({ severity: 'success', summary: 'Created', detail: 'Tag created successfully' });
        this.getTags();
      }
    });
  }

  openEdit(tag: BlogTag): void {
    this.ref = this.dialog.open(BlogTagFormComponent, {
      header: `Edit Tag: ${tag.resolved?.name || tag.name}`,
      width: '460px',
      data: { tag },
      closable: true,
      dismissableMask: true,
      modal: true,
    });

    this.ref.onClose.subscribe((updated) => {
      if (updated) {
        this.messages.add({ severity: 'success', summary: 'Updated', detail: 'Tag updated successfully' });
        this.getTags();
      }
    });
  }

  confirmDelete(tag: BlogTag): void {
    this.confirm.confirm({
      message: `Delete tag "${tag.resolved?.name || tag.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Delete',
      accept: () => this.delete(tag),
    });
  }

  private delete(tag: BlogTag): void {
    // assuming service.delete(id: number|string)
    this.tagService.delete(tag.id as any).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Deleted', detail: 'Tag deleted' });
        this.getTags();
      },
      error: () => this.messages.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete tag' }),
    });
  }

  openTranslation(tag: BlogTag, translation?: BlogTagTranslation | null): void {
    if (!tag.id) return;
    this.refTx = this.dialog.open(BlogTagTranslationFormComponent, {
      header: translation ? `Edit ${translation.language?.toUpperCase()} Translation` : 'Add Translation',
      width: '520px',
      data: {
        tagId: tag.id,
        translation,
        preferredLanguage: translation?.language,
      },
      dismissableMask: true,
      closable: true,
      modal: true,
    });

    this.refTx.onClose.subscribe((res: BlogTagTranslation) => {
      if (!res) return;
      const idx = this.tags.findIndex(t => t.id === tag.id);
      if (idx === -1) return;
      const txs = this.tags[idx].translations ?? [];
      const existingIdx = txs.findIndex(t => t.language === res.language);
      if (existingIdx !== -1) {
        txs[existingIdx] = res;
      } else {
        txs.push(res);
      }
      this.tags[idx] = {
        ...this.tags[idx],
        translations: [...txs],
        resolved: this.tags[idx].resolved?.language === res.language ? { ...this.tags[idx].resolved, ...{ name: res.name, slug: res.slug } } : this.tags[idx].resolved,
      };
      this.tags = [...this.tags];
      this.messages.add({ severity: 'success', summary: 'Saved', detail: 'Translation saved' });
    });
  }
}
