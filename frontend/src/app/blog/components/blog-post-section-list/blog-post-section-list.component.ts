import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BlogSection } from '../../models/blog-section.model';
import { BlogSectionTranslation } from '../../models/blog-section-translation.model';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BlogPostSectionFormComponent } from '../blog-post-section-form/blog-post-section-form.component';
import { BlogSectionTranslationFormComponent } from '../blog-section-translation-form/blog-section-translation-form.component';
import { ToastModule } from 'primeng/toast';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { BlogPostSectionService } from '../../services/blog-post-section.service';
import { PaginatedResponse } from '../../../models/paginated-response.model';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';
import { BlogImageDetailComponent } from '../blog-image-detail/blog-image-detail.component';
import { FaqItemListAdminComponent } from '../faq-item-list-admin/faq-item-list-admin.component';
import { BlogPostService } from '../../services/blog-post.service';
import { BlogPostFaqLink } from '../../models/blog-post-faq-link.model';
import { BlogVideoDetailComponent } from '../blog-video-detail/blog-video-detail.component';
import { BlogSectionMapDetailComponent } from '../blog-section-map-detail/blog-section-map-detail.component';

@Component({
  selector: 'app-blog-post-section-list',
  imports: [
    CommonModule,
    DragDropModule,
    ButtonModule,
    SelectButton, 
    ReactiveFormsModule, 
    FormsModule, 
    RouterLink, 
    ToastModule, ConfirmDialogModule, 
    SafeHtmlPipe, 
    BlogImageDetailComponent, FaqItemListAdminComponent, 
    BlogVideoDetailComponent, BlogSectionMapDetailComponent, 
  ],
  providers: [
      DialogService,
      MessageService,
      ConfirmationService,
      HttpErrorPrinterService,
  ],
  templateUrl: './blog-post-section-list.component.html',
  styleUrl: './blog-post-section-list.component.scss'
})
export class BlogPostSectionListComponent implements OnInit {
  postId!: number;
  sections: BlogSection[] = [];
  expandedSections: Set<number> = new Set<number>();
  faq_links: BlogPostFaqLink[] = [];

  refBlogSection: DynamicDialogRef | undefined;
  refBlogSectionTranslation: DynamicDialogRef | undefined;

  availableLanguages = [
    { label: 'EN', value: 'en' },
    { label: 'DE', value: 'de' },
    { label: 'RU', value: 'ru' },
    { label: 'TR', value: 'tr' }
  ];
  currentLanguage = 'en';

  constructor(
    private route: ActivatedRoute, 
    private dialogService: DialogService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private httpErrorPrinter: HttpErrorPrinterService, 
    private blogSectionSectionService: BlogPostSectionService, 
    private blogPostService: BlogPostService, 
  ) {}

  ngOnInit(): void {
    this.postId = +this.route.snapshot.paramMap.get('id')!;
    this.getBlogPostSections();
    this.getBlogPostFaqLibraryLinks();
  }

  getBlogPostSections(): BlogSection[] {
    this.blogSectionSectionService.getAllByPostId(this.postId).subscribe({
      next: (sections: PaginatedResponse<BlogSection>) => {
        this.sections = sections.results!;
        console.log('Blog post sections fetched:', this.sections);
        this.closeAll();
      },
      error: (error) => {
        this.httpErrorPrinter.printHttpError(error);
      }
    });
    return this.sections;
  }

  getBlogPostFaqLibraryLinks(): void {
    this.blogPostService.getById(Number(this.postId)).subscribe({
      next: (post) => {
        this.faq_links = post.faq_links || [];
      },
      error: (error) => {
        this.httpErrorPrinter.printHttpError(error);
      }
    });
  }

  getTranslation(section: BlogSection): BlogSectionTranslation | undefined {
    return section.translations?.find(t => t.language === this.currentLanguage);
  }


  isOpen(sectionId: number): boolean {
    return this.expandedSections.has(sectionId);
  }

  toggleSection(id: number): void {
    if (this.expandedSections.has(id)) {
      this.expandedSections.delete(id);
    } else {
      this.expandedSections.add(id);
    }
  }

  openAll(): void {
    this.sections.forEach(section => this.expandedSections.add(section.id!));
  }

  closeAll(): void {
    this.expandedSections.clear();
  }

  drop(event: any): void {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
  
    const moved = this.sections.splice(previousIndex, 1)[0];
    this.sections.splice(currentIndex, 0, moved);
  
    // Update local order
    this.sections.forEach((s, i) => (s.order = i));
  
    // Prepare payload for backend
    const reordered = this.sections.map(s => ({
      id: s.id!,
      order: s.order!
    }));
  
    this.blogSectionSectionService.reorder(reordered).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Sıralama kaydedildi!' });
      },
      error: (err) => {
        console.error('Error saving order:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Sıralama kaydedilemedi!' });
      }
    });
  }
  

  openBlogPostSectionForm(blogPostSectionToEdit: BlogSection | null = null): void {
        this.refBlogSection = this.dialogService.open(BlogPostSectionFormComponent, {
          header: 'BlogPostSection Ekle/Düzenle',
          styleClass: 'fit-content-dialog',
          contentStyle: { "overflow": "auto" },
          baseZIndex: 10000, 
          closable: true,
          modal: true,
          data: {
            blogPostSection: blogPostSectionToEdit, 
            postId: this.postId
          }, 
          maximizable: true,
          resizable: true,
        });
    
        this.refBlogSection.onClose.subscribe((blogPostSection: BlogSection) => {
          if (blogPostSection) {
            if (blogPostSectionToEdit) {
              this.messageService.add(
                { severity: 'success', summary: 'Success ', detail: 'BlogSection başarıyla güncellendi!' });
                // Update the section in the list
                const index = this.sections.findIndex(section => section.id === blogPostSection.id);
                if (index !== -1) {
                  this.sections[index] = blogPostSection;
                  // add the section id to expandedSections to keep it open
                  this.expandedSections.add(blogPostSection.id!);
                }
              } else {
                this.messageService.add(
                  { severity: 'success', summary: 'Success', detail: 'BlogSection başarıyla oluşturuldu!' });
                  this.sections.push(blogPostSection);
                  // add the section id to expandedSections to keep it open
                  this.expandedSections.add(blogPostSection.id!);
              }
            // Sort sections by order after adding or updating
            this.sections.sort((a, b) => a.order! - b.order!);
          }
        });
      }
  getTranslationByLanguage(section: BlogSection, language: string): BlogSectionTranslation | undefined {
    return section.translations?.find(t => t.language === language);
  }
  openBlogPostSectionTranslationForm(section: BlogSection, translationToEdit: BlogSectionTranslation | null = null): void {
    console.log('Opening translation form for section:', section, 'with translation:', translationToEdit);
    this.refBlogSectionTranslation = this.dialogService.open(BlogSectionTranslationFormComponent, {
      header: 'BlogSection ' + this.currentLanguage.toUpperCase() + ' Çeviri Ekle/Düzenle',
      styleClass: 'fit-content-dialog',
      contentStyle: { "overflow": "auto" },
      baseZIndex: 10000,
      closable: true,
      modal: true,
      data: {
        section: section,
        translation: translationToEdit,
        language: this.currentLanguage
      },
      maximizable: true,
      resizable: true,
    });
    this.refBlogSectionTranslation.onClose.subscribe((translation: BlogSectionTranslation) => {
      if (translation) {
        if (translationToEdit) {
          this.messageService.add(
            { severity: 'success', summary: 'Success', detail: 'BlogSection çevirisi başarıyla güncellendi!' });
        } else {
          this.messageService.add(
            { severity: 'success', summary: 'Success', detail: 'BlogSection çevirisi başarıyla oluşturuldu!' });
          // Add the new translation to the section
          
        }
        if (!section.translations) {
          section.translations = [];
        }
        this.getBlogPostSections();
      }
    });
  }


  deleteBlogPostSection(id: number): void {
    this.confirmationService.confirm({
      message: 'BlogSection silinsin mi?',
      accept: () => {
        this.blogSectionSectionService.delete(id).subscribe({
          next: () => {
            this.sections = this.sections.filter(section => section.id !== id);
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'BlogSection başarıyla silindi!' });
          },
          error: (error) => {
            console.error('Error deleting section:', error);
            this.httpErrorPrinter.printHttpError(error);
          }
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Silme işlemi iptal edildi.' });
      }
    });
  }


  gotoPreview(id: number): string {
    return `/admin/blog-posts/${id}/preview`;
  }

  gotoEditGeneralDetails(id: number): string {
    return `/admin/blog-posts/${id}`;
  }
}
