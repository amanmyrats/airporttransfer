import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { BlogPost } from '../../models/blog-post.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { FilterSearchComponent } from '../../../admin/components/filter-search/filter-search.component';
import { environment as env } from '../../../../environments/environment';
import { SharedPaginatorComponent } from '../../../admin/components/shared-paginator/shared-paginator.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BlogPostFormComponent } from '../blog-post-form/blog-post-form.component';
import { BlogPostService } from '../../services/blog-post.service';
import { PaginatedResponse } from '../../../models/paginated-response.model';

@Component({
  selector: 'app-blog-post-list',
  imports: [CommonModule, RouterModule, ButtonModule, TableModule,
    FilterSearchComponent, SharedPaginatorComponent,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [
      DialogService,
      MessageService,
      ConfirmationService,
      HttpErrorPrinterService,
  ],
  templateUrl: './blog-post-list.component.html',
  styleUrl: './blog-post-list.component.scss'
})
export class BlogPostListComponent implements OnInit {
  
    // Pagination
  @ViewChild(FilterSearchComponent) filterSearch!: FilterSearchComponent;
  first: number = 0;
  rows: number = 2;
  totalRecords: number = 0;

  ref: DynamicDialogRef | undefined;
  loading: boolean = false;

  blogPosts: BlogPost[] = [];

  constructor(
    private dialogService: DialogService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService, 
    private httpErrorPrinterService: HttpErrorPrinterService,
    private blogPostService: BlogPostService, 
  ) {}

  ngOnInit(): void {
    this.rows = env.pagination.defaultPageSize;
    
  }

  gotoDetail(id: number): string {
    return `/admin/blog-posts/${id}`;
  }

  gotoSections(id: number): string {
    return `/admin/blog-posts/${id}/sections`;
  }

  gotoPreview(id: number): string {
    return `/admin/blog-posts/${id}/preview`;
  }

  getBlogPosts(queryString: string = ''): void {
    this.loading = true;
    this.blogPostService.getAll(queryString).subscribe({
      next: (response: PaginatedResponse<BlogPost>) => {
        this.blogPosts = response.results!;
        this.totalRecords = response.count!;
        this.loading = false;
        console.log("Blog posts fetched successfully:", this.blogPosts);
      },
      error: (error) => {
        this.loading = false;
        this.httpErrorPrinterService.printHttpError(error);
      }
    });
  }

  openForm(blogPostToEdit: BlogPost | null = null): void {
    this.ref = this.dialogService.open(BlogPostFormComponent, {
      header: 'Blog Ekle/Düzenle',
      styleClass: 'fit-content-dialog',
      contentStyle: { "overflow": "auto" },
      baseZIndex: 10000, 
      closable: true,
      modal: true,
      data: {
        blogPost: blogPostToEdit
      }, 
      maximizable: true,
      resizable: true,
    });

    this.ref.onClose.subscribe((blogPost: BlogPost) => {
      if (blogPost) {
        if (blogPostToEdit) {
          this.messageService.add(
            { severity: 'success', summary: 'Success ', detail: 'BlogPost başarıyla güncellendi!' });
        } else {
          this.messageService.add(
            { severity: 'success', summary: 'Success', detail: 'BlogPost başarıyla oluşturuldu!' });
        }
        this.filterSearch.search();
      }
    });
  }


  deleteObj(id: string): void {
    this.confirmationService.confirm({
      message: 'Silmek istediğinizden emin misiniz?',
      header: 'Silme İşlemi',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",
      acceptLabel: "Sil",
      rejectLabel: "Vazgeç",
      dismissableMask: true,

      accept: () => {
        this.blogPostService.delete(id as any).subscribe({
          next: () => {
            this.getBlogPosts();
              this.messageService.add(
                {severity:'success', summary:'Başarılı', detail:'Başarıyla silindi!'});
          },
          error: (error: any) => {
            console.log("Error happened when deleting blogPost");
            console.log(error);
          }
        });
      }
    });
  }



  onPageChange(event: any): void {
    this.filterSearch.event.first = event.first;
    this.filterSearch.event.rows = event.rows;
    this.filterSearch.search();
  }

  search(queryString: string = ''): void {
    this.getBlogPosts(queryString);
  }

  getEnglishTitle(post: BlogPost): string {
    const translation = post.translations?.find(t => t.language === 'en');
    return translation ? translation.title! : 'No English Title';  
  }

}
