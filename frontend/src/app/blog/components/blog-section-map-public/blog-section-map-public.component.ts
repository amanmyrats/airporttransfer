import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { BlogSection } from '../../models/blog-section.model';
import { BlogSectionMap } from '../../models/blog-section-map.model';
import { BlogSectionMapTranslation } from '../../models/blog-section-map-translation.model';

@Component({
  selector: 'app-blog-section-map-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-section-map-public.component.html',
  styleUrl: './blog-section-map-public.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogSectionMapPublicComponent implements OnChanges {
  /** Section with optional map */
  @Input() section!: (BlogSection & { map?: BlogSectionMap | null }) | null;
  /** Language to resolve the embed URL */
  @Input() lang: string = 'en';
  /** Fallback height if backend doesn’t provide one */
  @Input() height: number = 420;

  /** Cached, stable value for template binding */
  safeUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  get map(): BlogSectionMap | null {
    return this.section?.map ?? null;
  }

  ngOnChanges(_: SimpleChanges): void {
    this.safeUrl = this.buildSafeUrl();
  }

  /** Normalize Google My Maps viewer → embed */
  private normalizeMyMaps(url?: string | null): string | null {
    if (!url) return null;
    return url
      .replace('/maps/d/u/0/viewer?', '/maps/d/u/0/embed?')
      .replace('/maps/d/viewer?', '/maps/d/embed?')
      .replace('/viewer?', '/embed?');
  }

  /** Build once per input change */
  private buildSafeUrl(): SafeResourceUrl | null {
    const m = this.map;
    if (!m) return null;

    const wanted = (this.lang || 'en').toLowerCase();
    const list: BlogSectionMapTranslation[] = m.translations ?? [];

    const url =
      list.find(t => (t.language || '').toLowerCase() === wanted)?.embed_url ||
      list.find(t => (t.language || '').toLowerCase() === 'en')?.embed_url ||
      m.resolved_url ||
      (list[0]?.embed_url ?? '');

    const normalized = this.normalizeMyMaps(url);
    return normalized ? this.sanitizer.bypassSecurityTrustResourceUrl(normalized) : null;
  }

  get heightToUse(): number {
    const m = this.map;
    const backendH = (m?.iframe_height ?? null) as any;
    const parsed = typeof backendH === 'string' ? parseInt(backendH, 10) : backendH;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : this.height;
  }
}
