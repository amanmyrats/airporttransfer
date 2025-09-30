import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';
import { ResolvedFaq } from '../../models/resolved-faq.model';

@Component({
  selector: 'app-faq-section-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-section-public.component.html',
  styleUrls: ['./faq-section-public.component.scss']
})
export class FaqSectionPublicComponent implements OnChanges {
  /** List of FAQs (question + answer HTML) */
  @Input() resolved_items: ResolvedFaq[] = [];

  /** Optional heading shown above the list */
  @Input() heading: string | null = 'Frequently Asked Questions';

  /** If true, open the first item when no item has is_expanded_by_default=true */
  @Input() openFirstByDefault = true;

  /** Inject structured data for Google (FAQPage) */
  @Input() enableJsonLd = true;

  private schemaEl?: HTMLScriptElement;

  constructor(private host: ElementRef, private r: Renderer2) {}

  ngOnChanges(): void {
    if (this.enableJsonLd) this.injectJsonLd();
  }

  /** Whether a given item should be open on first render */
  isOpen(i: number, item: ResolvedFaq): boolean {
    const explicit = this.toBool(item?.is_expanded_by_default);
    if (explicit) return true;

    const anyMarked = (this.resolved_items || []).some(x => this.toBool(x?.is_expanded_by_default));
    if (!anyMarked && this.openFirstByDefault) return i === 0;

    return false;
  }

  /** Stable anchor id without relying on a missing `anchor` field */
  anchorFor(i: number, item: ResolvedFaq): string {
    const fromKey = item?.key?.trim();
    const fromIdent = item?.internal_identifier?.trim();
    const fromId = item?.id != null ? `faq-${item.id}` : '';
    const fromQ = item?.question ? `faq-${this.slugify(item.question)}` : '';
    return this.slugify(fromKey || fromIdent || fromId || fromQ || `faq-${i + 1}`);
  }

  // ---------- JSON-LD ----------
  private injectJsonLd() {
    if (this.schemaEl) {
      this.r.removeChild(this.host.nativeElement, this.schemaEl);
      this.schemaEl = undefined;
    }
    if (!this.resolved_items?.length) return;

    const mainEntity = (this.resolved_items || [])
      .filter(i => (i?.question || '').trim())
      .map(i => ({
        '@type': 'Question',
        name: this.stripHtml(i.question || ''),
        acceptedAnswer: {
          '@type': 'Answer',
          text: this.stripScripts(i.answer || '')
        }
      }));

    if (!mainEntity.length) return;

    const s = this.r.createElement('script') as HTMLScriptElement;
    s.type = 'application/ld+json';
    s.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity });
    this.r.appendChild(this.host.nativeElement, s);
    this.schemaEl = s;
  }

  // ---------- helpers ----------
  private toBool(v: unknown): boolean {
    if (typeof v === 'boolean') return v;
    if (v == null) return false;
    const s = String(v).toLowerCase().trim();
    return s === '1' || s === 'true' || s === 'yes' || s === 'y';
  }

  private slugify(s: string): string {
    return (s || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }

  private stripHtml(html: string): string {
    const el = document.createElement('div');
    el.innerHTML = html || '';
    return (el.textContent || el.innerText || '').trim();
  }

  private stripScripts(html: string): string {
    const el = document.createElement('div');
    el.innerHTML = html || '';
    el.querySelectorAll('script').forEach(s => s.remove());
    return el.innerHTML;
  }
}
