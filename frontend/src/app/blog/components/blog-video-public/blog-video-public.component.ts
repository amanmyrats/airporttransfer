import { CommonModule } from '@angular/common';
import {
  Component, Input, ElementRef, ViewChild, Renderer2,
  OnChanges, SimpleChanges
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// ✅ use your existing models
import { BlogSection } from '../../models/blog-section.model';
import { BlogVideo } from '../../models/blog-video.model';
import { BlogVideoTranslation } from '../../models/blog-video-translation.model';
import { BlogVideoTrack } from '../../models/blog-video-track.model';

@Component({
  selector: 'app-blog-video-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-video-public.component.html',
  styleUrls: ['./blog-video-public.component.scss'],
})
export class BlogVideoPublicComponent implements OnChanges {
  /** Section that contains exactly one video (or null) */
  @Input() section!: (BlogSection & {
    video?: BlogVideo & {
      embed_src?: string | null;
      poster_url?: string | null;
      sources?: { hls_url?: string; dash_url?: string; file_url?: string; mime_type?: string };
      tracks?: BlogVideoTrack[];
    } | null;
  }) | null;

  /** UI / a11y / SEO options */
  @Input() lang: string = 'en';
  @Input() height: number = 420;
  @Input() showTitle: boolean = true;       // was false
  @Input() titleSrOnly: boolean = false;    // was true
  @Input() showDescription: boolean = true; // was false
  @Input() showTranscript: boolean = false; // keep as you like
  
  @Input() includeStructuredData: boolean = true; // JSON-LD VideoObject

  @ViewChild('jsonLdHost', { static: false }) jsonLdHost?: ElementRef<HTMLElement>;
  private jsonLdScriptEl: HTMLScriptElement | null = null;

  constructor(private sanitizer: DomSanitizer, private r2: Renderer2) {}

  ngOnChanges(_: SimpleChanges): void {
    // refresh JSON-LD whenever inputs change
    this.updateJsonLd();
  }

  /** Current video (if any) */
  get v(): (BlogVideo & {
    embed_src?: string | null;
    poster_url?: string | null;
    sources?: { hls_url?: string; dash_url?: string; file_url?: string; mime_type?: string };
    tracks?: BlogVideoTrack[];
  }) | null {
    return this.section?.video ?? null;
  }

  /** Pick translation: lang → en → first */
  get tx(): BlogVideoTranslation | null {
    const list: BlogVideoTranslation[] = this.v?.translations ?? [];
    const wanted = (this.lang || 'en').toLowerCase();
    return (
      list.find(t => (t.language || '').toLowerCase() === wanted) ||
      list.find(t => (t.language || '').toLowerCase() === 'en') ||
      list[0] ||
      null
    );
  }

  trustedEmbed(url?: string | null): SafeResourceUrl | null {
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  }

  /** Convert seconds to ISO8601 duration (PT##S) */
  private toIsoDuration(seconds?: string | number | null): string | undefined {
    const s = typeof seconds === 'string' ? parseInt(seconds, 10) : (seconds ?? 0);
    if (!s || isNaN(s)) return undefined;
    return `PT${s}S`;
  }

  /** Build and insert JSON-LD VideoObject for SEO */
  private updateJsonLd(): void {
    if (!this.includeStructuredData || !this.jsonLdHost) {
      // destroy if previously inserted
      if (this.jsonLdScriptEl && this.jsonLdScriptEl.parentNode) {
        this.jsonLdScriptEl.parentNode.removeChild(this.jsonLdScriptEl);
        this.jsonLdScriptEl = null;
      }
      return;
    }

    const v = this.v;
    const tx = this.tx;
    if (!v) {
      if (this.jsonLdScriptEl && this.jsonLdScriptEl.parentNode) {
        this.jsonLdScriptEl.parentNode.removeChild(this.jsonLdScriptEl);
        this.jsonLdScriptEl = null;
      }
      return;
    }

    const json: any = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: tx?.title || 'Video',
      description: tx?.description || tx?.caption || undefined,
      inLanguage: tx?.language || this.lang || undefined,
      embedUrl: v.embed_src || undefined,
      thumbnailUrl: v.poster_url || undefined,
      contentUrl: v.sources?.file_url || v.sources?.hls_url || v.sources?.dash_url || undefined,
      duration: this.toIsoDuration(v.duration_seconds as any),
      // Optional extras that won't hurt:
      uploadDate: (v as any).created_at || undefined,
    };

    const text = JSON.stringify(json, null, 2);
    // remove previous
    if (this.jsonLdScriptEl && this.jsonLdScriptEl.parentNode) {
      this.jsonLdScriptEl.parentNode.removeChild(this.jsonLdScriptEl);
    }
    // insert new
    const el = this.r2.createElement('script') as HTMLScriptElement;
    el.type = 'application/ld+json';
    el.text = text;
    this.r2.appendChild(this.jsonLdHost.nativeElement, el);
    this.jsonLdScriptEl = el;
  }
}
