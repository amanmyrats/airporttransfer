import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { BlogSection } from '../../models/blog-section.model';
import { BlogSectionMap } from '../../models/blog-section-map.model';
import { BlogSectionMapTranslation } from '../../models/blog-section-map-translation.model';
import { BlogSectionMapService } from '../../services/blog-section-map.service';
import { BlogSectionMapTranslationService } from '../../services/blog-section-map-translation.service';

import { BlogSectionMapFormComponent } from '../blog-section-map-form/blog-section-map-form.component';
import { BlogSectionMapTranslationFormComponent } from '../blog-section-map-translation-form/blog-section-map-translation-form.component';

@Component({
  selector: 'app-blog-section-map-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [DialogService, MessageService],
  templateUrl: './blog-section-map-detail.component.html',
  styleUrl: './blog-section-map-detail.component.scss'
})
export class BlogSectionMapDetailComponent implements OnInit {
  /** Blog section that may contain exactly one map (or null) */
  @Input() section!: BlogSection & { map?: BlogSectionMap | null };
  /** Selected language for translation panel */
  @Input() language: string = 'en';

  refMapForm?: DynamicDialogRef;
  refTxForm?: DynamicDialogRef;

  isRemoving = false;

  readonly dialogService = inject(DialogService);
  readonly messageService = inject(MessageService);
  readonly sanitizer = inject(DomSanitizer);

  private mapService = inject(BlogSectionMapService);
  private txService = inject(BlogSectionMapTranslationService);

  ngOnInit(): void {}

  /** Current map */
  get map(): BlogSectionMap | null {
    return (this.section as any)?.map ?? null;
  }

  /** Prefer translation embed for selected language; fallback to resolved_url */
  private normalizeMyMaps(url: string | null | undefined): string | null {
    if (!url) return null;
    // convert .../maps/d/(u/0/)?viewer?...  →  .../maps/d/embed?...
    return url
      .replace('/maps/d/u/0/viewer?', '/maps/d/u/0/embed?')
      .replace('/maps/d/viewer?', '/maps/d/embed?')
      .replace('/viewer?', '/embed?');
  }
  
  getMapSrc(m: BlogSectionMap | null): SafeResourceUrl | null {
    if (!m) return null;
    const lang = (this.language || 'en').toLowerCase();
    const list = m.translations || [];
    const raw =
      list.find(t => (t.language || '').toLowerCase() === lang)?.embed_url ||
      list.find(t => (t.language || '').toLowerCase() === 'en')?.embed_url ||
      m.resolved_url ||
      (list[0]?.embed_url || '');
  
    const normalized = this.normalizeMyMaps(raw);
    return normalized ? this.sanitizer.bypassSecurityTrustResourceUrl(normalized) : null;
  }
  
  /** Translation for selected language (lang→en→null) */
  getSelectedTranslation(m: BlogSectionMap): BlogSectionMapTranslation | null {
    const lang = (this.language || 'en').toLowerCase();
    const list = m?.translations ?? [];
    return (
      list.find(t => (t.language || '').toLowerCase() === lang) ||
      list.find(t => (t.language || '').toLowerCase() === 'en') ||
      null
    );
  }

  /** Open Add/Edit Map dialog */
  openMapForm(mapOrNull: BlogSectionMap | null): void {
    const m = mapOrNull ?? this.map;
    this.refMapForm = this.dialogService.open(BlogSectionMapFormComponent, {
      header: m?.section ? 'Edit Map' : 'Add Map',
      styleClass: 'fit-content-dialog',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true,
      data: m?.section ? { map: m } : { sectionId: (this.section as any).id },
      maximizable: true,
      resizable: true,
    });

    this.refMapForm.onClose.subscribe((res: BlogSectionMap) => {
      if (!res) return;
      (this.section as any).map = res;
      this.messageService.add({
        severity: 'success',
        summary: 'Saved',
        detail: m?.section ? 'Map updated.' : 'Map created.'
      });
    });
  }

  /** Open Add/Edit Translation dialog */
  openMapTranslationForm(sectionMapId: string | number, tx: BlogSectionMapTranslation | null): void {
    this.refTxForm = this.dialogService.open(BlogSectionMapTranslationFormComponent, {
      header: tx ? 'Edit Map Translation' : 'Add Map Translation',
      styleClass: 'fit-content-dialog',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true,
      data: { 
        sectionMapId, 
        translation: tx, 
        preferredLanguage: this.language 
      },
      maximizable: true,
      resizable: true,
    });

    this.refTxForm.onClose.subscribe((res: BlogSectionMapTranslation) => {
      if (!res) return;
      const m = this.map;
      if (!m) return;

      const list = m.translations ?? [];
      const idx = list.findIndex(t => t.language === res.language);
      if (idx !== -1) list[idx] = res; else list.push(res);
      m.translations = [...list];
      (this.section as any).map = { ...(m as any) };

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Map translation saved.' });
    });
  }

  /** Delete the map (by section PK) */
  deleteMap(sectionId: string | number): void {
    this.isRemoving = true;
    this.mapService.delete(sectionId).subscribe({
      next: () => {
        (this.section as any).map = null;
        this.isRemoving = false;
      },
      error: (err) => {
        console.error('Delete map failed:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete map.' });
        this.isRemoving = false;
      }
    });
  }
}
