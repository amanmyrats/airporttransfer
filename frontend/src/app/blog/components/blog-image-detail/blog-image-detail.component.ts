import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogImage } from '../../models/blog-image.model';
import { BlogImageService } from '../../services/blog-image.service';
import { BlogSection } from '../../models/blog-section.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BlogImageFormComponent } from '../blog-image-form/blog-image-form.component';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormBuilder } from '@angular/forms';
import { BlogImageTranslationFormComponent } from '../blog-image-translation-form/blog-image-translation-form.component';
import { BlogImageTranslation } from '../../models/blog-image-translation.model';
import { UpdateImageNameFormComponent } from '../update-image-name-form/update-image-name-form.component';

@Component({
  selector: 'app-blog-image-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    FileUploadModule,
    ProgressSpinnerModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [DialogService],
  templateUrl: './blog-image-detail.component.html',
  styleUrl: './blog-image-detail.component.scss'
})
export class BlogImageDetailComponent implements OnInit {
  @Input() section!: BlogSection;
  @Input() language: string = 'en'; // selected language from top left

  refBlogImage?: DynamicDialogRef;
  refBlogImageTranslation?: DynamicDialogRef;
  refUpdateImageName?: DynamicDialogRef;

  isUploadingImage = false;
  isRemovingImage = false;

  readonly dialogService = inject(DialogService);
  readonly messageService = inject(MessageService);
  readonly blogImageService = inject(BlogImageService);
  readonly fb = inject(FormBuilder);

  ngOnInit(): void {}

  /** Returns the single translation matching the currently selected language */
  getSelectedTranslation(blogImage: BlogImage): BlogImageTranslation | null {
    const lang = (this.language || 'en').toLowerCase();
    const list = blogImage?.translations ?? [];
    const exact = list.find(t => (t.language || '').toLowerCase() === lang);
    return exact || null;
  }

  getImageFileName(imageUrl?: string): string {
    if (!imageUrl) return '';
    const withoutQuery = imageUrl.split('?')[0] ?? '';
    const segments = withoutQuery.split('/');
    return segments[segments.length - 1] || '';
  }

  private getImageNameWithoutExtension(imageUrl?: string): string {
    const fileName = this.getImageFileName(imageUrl);
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName;
  }

  private getImageExtension(imageUrl?: string): string {
    const fileName = this.getImageFileName(imageUrl);
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex > -1 ? fileName.substring(dotIndex) : '';
  }

  openBlogImageForm(blogImageToEdit: BlogImage | null = null): void {
    this.refBlogImage = this.dialogService.open(BlogImageFormComponent, {
      header: 'BlogImage Ekle/Düzenle',
      styleClass: 'fit-content-dialog',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true,
      data: { blogImage: blogImageToEdit },
      maximizable: true,
      resizable: true
    });

    this.refBlogImage.onClose.subscribe((blogImage: BlogImage) => {
      if (!blogImage) return;

      if (blogImageToEdit) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'BlogImage başarıyla güncellendi!' });
        this.section.images = (this.section.images ?? []).map(img => img.id === blogImage.id ? blogImage : img);
      } else {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'BlogImage başarıyla oluşturuldu!' });
        this.section.images ??= [];
        this.section.images.push(blogImage);
      }
    });
  }

  openBlogImageTranslationForm(blogImageId: number, translationToEdit: BlogImageTranslation | null = null): void {
    this.refBlogImageTranslation = this.dialogService.open(BlogImageTranslationFormComponent, {
      header: 'BlogImage Translation Ekle/Düzenle',
      styleClass: 'fit-content-dialog',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true,
      data: {
        blogImageId: blogImageId,               // ensure the form receives FK as "imageId"
        translation: translationToEdit,     // pass translation if editing
        preferredLanguage: this.language    // optional: let form preselect language
      },
      maximizable: true,
      resizable: true
    });

    this.refBlogImageTranslation.onClose.subscribe((blogImageTranslation: BlogImageTranslation) => {
      if (!blogImageTranslation) return;

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'BlogImage çevirisi başarıyla güncellendi!' });

      // Update in-place: replace or add for that image (only selected language shown anyway)
      const imgs = this.section.images ?? [];
      const imgIndex = imgs.findIndex(img => img.id === blogImageId);
      if (imgIndex === -1) return;

      const translations = imgs[imgIndex].translations ?? [];
      const idx = translations.findIndex(t => t.language === blogImageTranslation.language);
      if (idx !== -1) translations[idx] = blogImageTranslation;
      else translations.push(blogImageTranslation);

      imgs[imgIndex].translations = [...translations];
      this.section.images = [...imgs]; // trigger change detection (OnPush friendly)
    });
  }

  openUpdateImageNameForm(blogImage: BlogImage): void {
    if (!blogImage.id) return;

    const fileName = this.getImageFileName(blogImage.image);
    const ref = this.dialogService.open(UpdateImageNameFormComponent, {
      header: 'Rename Image',
      styleClass: 'fit-content-dialog',
      contentStyle: { overflow: 'hidden' },
      baseZIndex: 10000,
      modal: true,
      closable: true,
      data: {
        imageId: blogImage.id,
        fileName,
        suggestedName: this.getImageNameWithoutExtension(blogImage.image),
        extension: this.getImageExtension(blogImage.image),
      }
    });

    this.refUpdateImageName = ref;
    ref.onClose.subscribe((result) => {
      if (!result) return;

      const imgs = this.section.images ?? [];
      const idx = imgs.findIndex(img => img.id === blogImage.id);
      if (idx === -1) return;

      const updatedImageUrl = result?.image ?? blogImage.image;
      const updated = { ...imgs[idx], image: updatedImageUrl };
      imgs[idx] = updated;
      this.section.images = [...imgs];

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Image name updated successfully.' });
    });
  }

  onImageUpload(event: any, blogImageId: number): void {
    this.isUploadingImage = true;
    const file = event?.files?.[0];
    if (!file) { this.isUploadingImage = false; return; }

    this.blogImageService.uploadImage(blogImageId, file).subscribe({
      next: (response) => {
        const imgs = this.section.images ?? [];
        const idx = imgs.findIndex(img => img.id === blogImageId);
        if (idx !== -1) {
          imgs[idx] = { ...imgs[idx], image: response.image };
          this.section.images = [...imgs];
        }
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Image uploaded successfully!' });
        this.isUploadingImage = false;
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload image.' });
        this.isUploadingImage = false;
      }
    });
  }

  deleteImage(blogImageId: number): void {
    this.isRemovingImage = true;
    this.blogImageService.delete(blogImageId).subscribe({
      next: () => {
        this.section.images = (this.section.images ?? []).filter(i => i.id !== blogImageId);
        this.isRemovingImage = false;
      },
      error: (error) => {
        console.error('Error deleting main image:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete main image.' });
        this.isRemovingImage = false;
      }
    });
  }

  addNewEmptyBlogImage(sectionId: number): void {
    this.blogImageService.createEmpty(sectionId).subscribe({
      next: (createdImage) => {
        this.section.images ??= [];
        this.section.images = [...this.section.images, createdImage];
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'New empty BlogImage created!' });
      },
      error: (err) => {
        console.error('Error creating new empty BlogImage:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create new BlogImage.' });
      }
    });
  }

  /** Optional helper if you need a dynamic edit button label elsewhere */
  getTranslationEditLabel(translation: BlogImageTranslation): string {
    return translation?.language ? `Edit (${translation.language})` : 'Add Translation';
  }
}
