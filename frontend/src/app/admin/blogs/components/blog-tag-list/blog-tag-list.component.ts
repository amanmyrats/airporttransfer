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
import { PaginatedResponse } from '../../../../models/paginated-response.model';

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
      header: `Edit Tag: ${tag.name}`,
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
      message: `Delete tag "${tag.name}"?`,
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
}
