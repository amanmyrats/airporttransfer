import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogPostService } from '../../services/blog-post.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BlogPostTranslation } from '../../models/blog-post-translation.model';
import { BlogPostTranslationFormComponent } from '../blog-post-translation-form/blog-post-translation-form.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { FileUploadModule } from 'primeng/fileupload';
import { BlogPost } from '../../models/blog-post.model';
import { BlogPostFormComponent } from '../blog-post-form/blog-post-form.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CdkDragPlaceholder } from "@angular/cdk/drag-drop";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ToastModule } from 'primeng/toast';
import { BlogPostTranslationService } from '../../services/blog-post-translation.service';

@Component({
  selector: 'app-blog-post-detail',
  imports: [
    CommonModule, RouterLink, ButtonModule, FileUploadModule,
    ProgressSpinnerModule,
    ToastModule, ConfirmDialogModule, 
],
  providers: [
      DialogService,
      MessageService,
      ConfirmationService,
      HttpErrorPrinterService,
  ],
  templateUrl: './blog-post-detail.component.html',
  styleUrl: './blog-post-detail.component.scss'
})
export class BlogPostDetailComponent implements OnInit {
  postId!: number;
  post: any = null;
  ref: DynamicDialogRef | undefined;

  isUploadingMainImage: boolean = false;
  isRemovingMainImage: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private blogPostService: BlogPostService, 
    private dialogService: DialogService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private httpErrorPrinter: HttpErrorPrinterService, 
    private blogPostTranslationService: BlogPostTranslationService, 
  ) {}

  ngOnInit(): void {
    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPost(this.postId as any);
  }

  loadPost(id: string): void {

    this.blogPostService.getById(id as any).subscribe({
      next: (response) => {
        this.post = response;
        console.log("Blog post fetched successfully:", this.post);
      },
      error: (error) => {
        console.error('Error fetching blog post:', error);
        // Handle error, show message, etc.
      }
    });

    
  }


  onImageUpload(event: any) {
    this.isUploadingMainImage = true;
    const file = event.files?.[0];
    console.log('File selected for upload:', file);
    if (file) {
      this.blogPostService.uploadMainImage(this.postId, file).subscribe({
        next: (response) => {
          console.log('Image uploaded successfully:', response);
          this.post.main_image = response.main_image; // Assuming the response contains the image URL
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Image uploaded successfully!' });
          this.isUploadingMainImage = false;
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload image.' });
          this.isUploadingMainImage = false;
        }
      });
    }
  }

  deleteMainImage(): void {
    this.isRemovingMainImage = true;
    this.blogPostService.deleteMainImage(this.postId).subscribe({
      next: () => {
        console.log('Main image deleted successfully');
        this.post.main_image = null; // Clear the image from the post
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Main image deleted successfully!' });
        this.isRemovingMainImage = false;
      },
      error: (error) => {
        console.error('Error deleting main image:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete main image.' });
        this.isRemovingMainImage = false;
      }
    });
  }


  getCategoryName(): string {
    return this.post?.category?.name || '—';
  }

  getTagNames(): string {
    return this.post?.tags?.map((tag: any) => tag.name).join(', ') || '—';
  }

  getLanguageLabel(langCode: string): string {
    const map: any = {
      en: 'English',
      de: 'German',
      ru: 'Russian',
      tr: 'Turkish'
    };
    return map[langCode] || langCode;
  }

  getEditPostUrl(): string {
    return `/admin/blog-posts/${this.postId}/edit`;
  }

  getEditTranslationUrl(tid: number): string {
    return `/admin/blog-post-translations/${tid}/edit`;
  }

    openBlogPostTranslationForm(blogPostTranslationToEdit: BlogPostTranslation | null = null): void {
      this.ref = this.dialogService.open(BlogPostTranslationFormComponent, {
        header: 'Create / Edit Blog Post Translation',
        styleClass: 'fit-content-dialog',
        contentStyle: { "overflow": "auto" },
        baseZIndex: 10000, 
        closable: true,
        modal: true,
        data: {
          blogPostId: this.postId,
          blogPostTranslation: blogPostTranslationToEdit
        }, 
        maximizable: true,
        resizable: true,
      });
  
      this.ref.onClose.subscribe((blogPost: BlogPostTranslation) => {
        if (blogPost) {
          if (blogPostTranslationToEdit) {
            this.messageService.add(
              { severity: 'success', summary: 'Success ', detail: 'BlogPostTranslation başarıyla güncellendi!' });
          } else {
            this.messageService.add(
              { severity: 'success', summary: 'Success', detail: 'BlogPostTranslation başarıyla oluşturuldu!' });
          }
          // refresh current page
          this.loadPost(this.postId as any);
        }
      });
    }
  
  
    openBlogPostForm(blogPostToEdit: BlogPost | null = null): void {
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
          this.post = blogPost;
        }
      });
    }
  
    deleteBlogPostTranslation(id: number): void {
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete this translation?',
        accept: () => {
          this.blogPostTranslationService.delete(id).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Translation deleted successfully!' });
              // Refresh the post data
              this.loadPost(this.postId as any);
            },
            error: (error) => {
              console.error('Error deleting translation:', error);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete translation.' });
            }
          });
        }
      });
    }



  gotoPreview(id: number): string {
    return `/admin/blog-posts/${id}/preview`;
  }


  gotoSections(id: number): string {
    return `/admin/blog-posts/${id}/sections`;
  }
}
