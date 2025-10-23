import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { BlogCategory } from '../../models/blog-category.model';
import { BlogCategoryService } from '../../services/blog-category.service';
import { BlogCategoryFormComponent } from '../blog-category-form/blog-category-form.component';
import { PaginatedResponse } from '../../../../models/paginated-response.model';

@Component({
  selector: 'app-blog-category-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [DialogService, ConfirmationService, MessageService],
  templateUrl: './blog-category-list.component.html',
  styleUrl: './blog-category-list.component.scss'
})
export class BlogCategoryListComponent implements OnInit {
  private dialog = inject(DialogService);
  private confirm = inject(ConfirmationService);
  private messages = inject(MessageService);
  categoryService = inject(BlogCategoryService);

  categories: BlogCategory[] = [];
  ref?: DynamicDialogRef;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.categoryService.getAll().subscribe({
      next: (data: PaginatedResponse<BlogCategory>) => this.categories = data?.results! ?? data ?? [],
      error: () => this.messages.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' }),
    });
  }

  openCreate(): void {
    this.ref = this.dialog.open(BlogCategoryFormComponent, {
      header: 'Create Category',
      width: '460px',
      data: { category: null },
      dismissableMask: true,
      closable: true,
      modal: true,
    });

    this.ref.onClose.subscribe((created) => {
      if (created) {
        this.messages.add({ severity: 'success', summary: 'Created', detail: 'Category created' });
        this.load();
      }
    });
  }

  openEdit(category: BlogCategory): void {
    this.ref = this.dialog.open(BlogCategoryFormComponent, {
      header: `Edit Category: ${category.name}`,
      width: '460px',
      data: { category },
      dismissableMask: true,
      closable: true,
      modal: true,
    });

    this.ref.onClose.subscribe((updated) => {
      if (updated) {
        this.messages.add({ severity: 'success', summary: 'Updated', detail: 'Category updated' });
        this.load();
      }
    });
  }

  confirmDelete(category: BlogCategory): void {
    this.confirm.confirm({
      message: `Delete category "${category.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Delete',
      accept: () => this.delete(category),
    });
  }

  private delete(category: BlogCategory): void {
    this.categoryService.delete(category.id as any).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Deleted', detail: 'Category deleted' });
        this.load();
      },
      error: () => this.messages.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete category' }),
    });
  }
}
