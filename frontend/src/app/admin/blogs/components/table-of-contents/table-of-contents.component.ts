import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BlogSection } from '../../models/blog-section.model';
import { BlogSectionTranslation } from '../../models/blog-section-translation.model';
import { LanguageCode } from '../../../../constants/language.contants';

type LangCode = LanguageCode | string;

interface TocEntry {
  id: number | string;
  label: string;
  anchor: string;
}

@Component({
  selector: 'app-table-of-contents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-of-contents.component.html',
  styleUrls: ['./table-of-contents.component.scss'],
})
export class TableOfContentsComponent {
  /** Target language key (e.g., 'en' | 'de' | 'ru' | 'tr') */
  @Input({ required: true }) language!: LangCode;

  /** Sections from API */
  @Input({ required: true }) sections: BlogSection[] = [];

  /** Max height (px) before content becomes scrollable */
  @Input() maxHeight = 320;

  /** Optional selector of a custom scroll container (else document) */
  @Input() scrollContainerSelector?: string;

  /**
   * Which section types to include in TOC. (Hide visuals/utility blocks by default.)
   * Adjust from the parent if needed.
   */
  @Input() includeTypes: Array<BlogSection['section_type']> = [
    'text', 'faq', 'steps', 'table', 'features', 'download',
  ];

  /**
   * If true, only include sections that have a non-empty heading in the chosen language.
   */
  @Input() requireHeading = true;

  opened = false;

  /** Build anchors + labels for chosen language, filtering unwanted section types */
  get items(): TocEntry[] {
    const lang = (this.language || '').toLowerCase();
    const includeSet = new Set(this.includeTypes || []);

    return (this.sections || [])
      .filter((s) => {
        if (s.section_type && !includeSet.has(s.section_type)) return false;
        if (!this.requireHeading) return true;
        const t = (s.translations || []).find(x => (x.language || '').toLowerCase() === lang);
        return !!t?.heading?.trim();
      })
      .map((s) => {
        const t: BlogSectionTranslation | undefined = (s.translations || [])
          .find(x => (x.language || '').toLowerCase() === lang);

        const label = (t?.heading?.trim()) ?? `Section ${s.id ?? ''}`.trim();

        // If you later add t.anchor in your model, prefer it:
        // const anchor = (t as any)?.anchor?.trim() || this.buildAnchor(label, String(s.id ?? ''));

        const anchor = this.buildAnchor(label, String(s.id ?? ''));

        return { id: s.id ?? label, label, anchor };
      });
  }

  private buildAnchor(heading: string, suffix: string): string {
    const base = (heading || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    const slug = base || 'section';
    return `${slug}-${suffix}`;
  }

  private getScrollContainer(): HTMLElement | Document {
    if (this.scrollContainerSelector) {
      const el = document.querySelector<HTMLElement>(this.scrollContainerSelector);
      if (el) return el;
    }
    return document;
  }

  scrollToSection(entry: TocEntry) {
    const targetId = entry.anchor;
    const target =
      document.getElementById(targetId) ||
      document.querySelector<HTMLElement>(`[name="${targetId}"]`);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      location.hash = targetId.startsWith('#') ? targetId : `#${targetId}`;
    }
  }

  trackById = (_: number, e: TocEntry) => e.id;

  /** Localized title (your version preserved) */
  get_title(lang: string = 'en'): string {
    switch ((lang || '').toLowerCase()) {
      case 'de': return 'Inhaltsverzeichnis';
      case 'ru': return 'Оглавление';
      case 'tr': return 'İçindekiler';
      case 'en':
      default: return 'Table of contents';
    }
  }
}
