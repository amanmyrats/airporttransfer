import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { BlogSection } from '../../models/blog-section.model';
import { BlogVideo } from '../../models/blog-video.model';
import { BlogVideoTranslation } from '../../models/blog-video-translation.model';
import { BlogVideoService } from '../../services/blog-video.service';
import { BlogVideoTranslationFormComponent } from '../blog-video-translation-form/blog-video-translation-form.component';
import { BlogVideoFormComponent } from '../blog-video-form/blog-video-form.component';

@Component({
  selector: 'app-blog-video-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    FileUploadModule,
    ProgressSpinnerModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [DialogService, MessageService],
  templateUrl: './blog-video-detail.component.html',
  styleUrl: './blog-video-detail.component.scss'
})
export class BlogVideoDetailComponent implements OnInit {
  /** Entire blog section; expects a single `video` (or null). */
  @Input() section!: BlogSection;
  /** Selected language code for i18n panel. */
  @Input() language: string = 'en';

  refVideoTranslation?: DynamicDialogRef;
  refVideoForm?: DynamicDialogRef;

  isUploadingPoster = false;
  isRemovingVideo = false;

  readonly dialogService = inject(DialogService);
  readonly messageService = inject(MessageService);
  readonly videoService = inject(BlogVideoService);
  readonly sanitizer = inject(DomSanitizer);

  ngOnInit(): void {}

  /** Single video getter (section.video). */
  get video(): BlogVideo | null {
    const anySection = this.section as any;
    return (anySection && anySection.video) ? (anySection.video as BlogVideo) : null;
  }

  /** Translation for selected language. */
  getSelectedTranslation(video: BlogVideo): BlogVideoTranslation | null {
    const lang = (this.language || 'en').toLowerCase();
    const list = video?.translations ?? [];
    return list.find(t => (t.language || '').toLowerCase() === lang) || null;
  }

  /** Create/Edit dialog for video. */
  openBlogVideoForm(videoOrNull: BlogVideo | null): void {
    const v = videoOrNull ?? this.video;
    this.refVideoForm = this.dialogService.open(BlogVideoFormComponent, {
      header: v?.id ? 'Edit Video' : 'Add Video',
      styleClass: 'fit-content-dialog',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true,
      data: v?.id ? { video: v } : { sectionId: (this.section as any).id },
      maximizable: true,
      resizable: true
    });

    this.refVideoForm.onClose.subscribe((res: BlogVideo) => {
      if (!res) return;
      (this.section as any).video = res;
      this.messageService.add({
        severity: 'success',
        summary: v?.id ? 'Saved' : 'Created',
        detail: v?.id ? 'Video updated.' : 'Video created.'
      });
    });
  }

  /** Create/Edit dialog for translation. */
  openBlogVideoTranslationForm(videoId: string, translationToEdit: BlogVideoTranslation | null = null): void {
    this.refVideoTranslation = this.dialogService.open(BlogVideoTranslationFormComponent, {
      header: translationToEdit ? 'Edit Video Translation' : 'Add Video Translation',
      styleClass: 'fit-content-dialog',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true,
      data: { videoId, translation: translationToEdit, preferredLanguage: this.language },
      maximizable: true,
      resizable: true
    });

    this.refVideoTranslation.onClose.subscribe((res: BlogVideoTranslation) => {
      if (!res) return;
      const v = this.video;
      if (!v) return;

      const translations = v.translations ?? [];
      const idx = translations.findIndex(t => t.language === res.language);
      if (idx !== -1) translations[idx] = res; else translations.push(res);
      v.translations = [...translations];
      (this.section as any).video = { ...(v as any) };

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Video translation saved.' });
    });
  }

  // ---------- Poster + Delete ----------
  onPosterUpload(event: any, videoId: string): void {
    this.isUploadingPoster = true;
    const file = event?.files?.[0];
    if (!file) { this.isUploadingPoster = false; return; }

    this.videoService.uploadPoster(videoId, file).subscribe({
      next: (response) => {
        const v = this.video;
        if (v) {
          (v as any).poster = response?.poster ?? (v as any).poster;
          (this.section as any).video = { ...(v as any) };
        }
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Poster uploaded.' });
        this.isUploadingPoster = false;
      },
      error: (err) => {
        console.error('Poster upload failed:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload poster.' });
        this.isUploadingPoster = false;
      }
    });
  }

  deleteVideo(videoId: string): void {
    this.isRemovingVideo = true;
    this.videoService.delete(videoId).subscribe({
      next: () => {
        (this.section as any).video = null;
        this.isRemovingVideo = false;
      },
      error: (err) => {
        console.error('Delete video failed:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete video.' });
        this.isRemovingVideo = false;
      }
    });
  }

  // ---------- Player helpers (no `as any` in template) ----------
  getEmbedSrc(v: BlogVideo | null): SafeResourceUrl | null {
    if (!v) return null;
    const provider = (v as any)?.provider?.toLowerCase?.() || '';
    const vid = (v as any)?.provider_video_id || (v as any)?.video_id || '';
    if (!vid) return null;

    if (provider === 'youtube') {
      const url = `https://www.youtube.com/embed/${vid}` + this._ytParams(v);
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    if (provider === 'vimeo') {
      const url = `https://player.vimeo.com/video/${vid}` + this._vimeoParams(v);
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return null;
  }

  private _ytParams(v: BlogVideo): string {
    const q: string[] = [];
    const start = (v as any)?.start_at ?? (v as any)?.start_time;
    const end = (v as any)?.end_at;
    if (start) q.push(`start=${start}`);
    if (end) q.push(`end=${end}`);
    if (v.autoplay) q.push('autoplay=1');
    if (v.muted) q.push('mute=1');
    q.push(`controls=${(v.controls ?? true) ? 1 : 0}`);
    return q.length ? `?${q.join('&')}` : '';
  }

  private _vimeoParams(v: BlogVideo): string {
    const q: string[] = [];
    if (v.autoplay) q.push('autoplay=1');
    if (v.muted) q.push('muted=1');
    if (v.controls === false) q.push('controls=0');
    return q.length ? `?${q.join('&')}` : '';
  }

  getPosterUrl(v: BlogVideo | null): string | null {
    if (!v) return null;
    return (v as any)?.poster || (v as any)?.poster_image || null;
  }

  // attribute helpers (presence/absence)
  private boolAttr(value: unknown, defaultVal: boolean): '' | null {
    const b = value === undefined || value === null ? defaultVal : !!value;
    return b ? '' : null;
  }
  attrControls(v: BlogVideo | null)   { return this.boolAttr(v?.controls, true); }
  attrAutoplay(v: BlogVideo | null)   { return this.boolAttr(v?.autoplay, false); }
  attrMuted(v: BlogVideo | null)      { return this.boolAttr(v?.muted, false); }
  attrLoop(v: BlogVideo | null)       { return this.boolAttr(v?.loop, false); }
  attrPlaysInline(v: BlogVideo | null){ return this.boolAttr((v as any)?.playsinline, true); }
  preloadVal(v: BlogVideo | null): string {
    return ((v as any)?.preload as string) || 'metadata';
  }

  // sources & tracks
  hasHls(v: BlogVideo | null)  { return !!(v && (v as any).hls_url); }
  hasDash(v: BlogVideo | null) { return !!(v && (v as any).dash_url); }
  hasFile(v: BlogVideo | null) { return !!(v && (v as any).file); }
  hlsUrl(v: BlogVideo | null)  { return (v && (v as any).hls_url)  || ''; }
  dashUrl(v: BlogVideo | null) { return (v && (v as any).dash_url) || ''; }
  fileUrl(v: BlogVideo | null) { return (v && (v as any).file)     || ''; }
  mimeType(v: BlogVideo | null){ return (v && (v as any).mime_type) || 'video/mp4'; }
  getTracks(v: BlogVideo | null): any[] {
    if (!v) return [];
    return (v as any).caption_tracks || (v as any).tracks || [];
  }
  trackTrack = (_: number, t: any) => t?.id ?? t?.language ?? _;
}
