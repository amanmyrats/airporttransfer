import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { BlogSection } from '../../models/blog-section.model';
import { FaqItemFormComponent } from '../faq-item-form/faq-item-form.component';
import { FaqLibraryItemService } from '../../services/faq-library-item.service';
import { FaqLibraryItemTranslationService } from '../../services/faq-library-item-translation.service';
import { FaqLibraryItem } from '../../models/faq-library-item.model';
import { FaqLibraryItemFormComponent } from '../faq-library-item-form/faq-library-item-form.component';
import { FaqLibraryItemTranslationFormComponent } from '../faq-library-item-translation-form/faq-library-item-translation-form.component';
import { FaqLibraryItemTranslation } from '../../models/faq-library-item-translation.model';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FilterSearchComponent } from '../../../../admin/components/filter-search/filter-search.component';
import { SharedPaginatorComponent } from '../../../../admin/components/shared-paginator/shared-paginator.component';
import { LazyLoadParams } from '../../../../interfaces/custom-lazy-load-event';
import { CommonService } from '../../../../services/common.service';
import { environment as env } from '../../../../../environments/environment';
import { BlogPostFaqLinkService } from '../../services/blog-post-faq-link.service';
import { BlogPostService } from '../../services/blog-post.service';
import { BlogPost } from '../../models/blog-post.model';
import { BlogPostFaqLink } from '../../models/blog-post-faq-link.model';

@Component({
  selector: 'app-faq-library-list',
  imports: [
    CommonModule,
    DragDropModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule,
    ConfirmDialogModule,
    FormsModule,
    AutoCompleteModule,
    FilterSearchComponent,
    SharedPaginatorComponent,
  ],
  providers: [DialogService, MessageService],
  templateUrl: './faq-library-list.component.html',
  styleUrl: './faq-library-list.component.scss'
})
export class FaqLibraryListComponent implements OnInit {
  @ViewChild(FilterSearchComponent) filterSearchCmp?: FilterSearchComponent;

  faqs = signal<FaqLibraryItem[]>([]);
  visibleFaqs: FaqLibraryItem[] = [];
  private filteredFaqs: FaqLibraryItem[] = [];

  first = 0;
  rows = env.pagination.defaultPageSize;
  totalRecords = 0;

  readonly defaultOrdering = 'order';
  readonly orderingOptions = [
    { label: 'Manual order (asc)', value: 'order' },
    { label: 'Manual order (desc)', value: '-order' },
  ];

  private searchTerm = '';
  private currentOrdering = this.defaultOrdering;
  private keyFilter = '';
  private featuredFilter = '';
  private expandedFilter = '';
  private linkService = inject(BlogPostFaqLinkService);
  private blogService = inject(BlogPostService);

  private faqService = inject(FaqLibraryItemService);
  private faqTxService = inject(FaqLibraryItemTranslationService);
  private dialogService = inject(DialogService);
  private message = inject(MessageService);
  private commonService = inject(CommonService);


  // link UI state
  linkingForId: string | null = null;
  blogSearchResults: BlogPost[] = [];
  selectedBlog: BlogPost | null = null;

  refFaq?: DynamicDialogRef;
  refFaqTx?: DynamicDialogRef;

  // state
  loading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  onFilterSearch(queryString: string): void {
    this.applyQueryState(queryString);
    this.updateVisibleFaqs();
  }

  onPageChange(event: LazyLoadParams): void {
    if (!this.filterSearchCmp) {
      this.first = event.first ?? 0;
      this.rows = event.rows ?? this.rows;
      this.updateVisibleFaqs();
      return;
    }

    if (typeof event.first === 'number') {
      this.filterSearchCmp.event.first = event.first;
    }
    if (typeof event.rows === 'number') {
      this.filterSearchCmp.event.rows = event.rows;
    }
    this.filterSearchCmp.search();
  }

  load(): void {
    this.loading.set(true);
    this.faqService.getAll({ ordering: 'order' }).subscribe({
      next: res => {
        const rows = res.results! ?? [];
        // attach empty links array so template can bind immediately
        rows.forEach((r: any) => (r.links = r.links ?? []));
        console.log('Loaded FAQ items:', rows);
        this.faqs.set(rows);
        this.loading.set(false);
        this.updateVisibleFaqs();
  
        // fetch links per item
        // rows.forEach((it: any) => this.fetchLinks(it));
      },
      error: () => {
        this.loading.set(false);
        this.message.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load FAQ items' });
        this.visibleFaqs = [];
        this.totalRecords = 0;
      }
    });
  }

  private applyQueryState(queryString: string): void {
    const params = this.commonService.parseQueryParams(queryString);
    this.searchTerm = this.extractParamValue(params, 'search').trim();
    const ordering = this.extractParamValue(params, 'ordering');
    this.currentOrdering = ordering || this.defaultOrdering;
    this.keyFilter = this.extractParamValue(params, 'key');
    this.featuredFilter = this.extractParamValue(params, 'is_featured');
    this.expandedFilter = this.extractParamValue(params, 'is_expanded_by_default');

    const nextRows = this.parsePositiveInt(this.extractParamValue(params, 'page_size'), this.rows || env.pagination.defaultPageSize);
    const nextPage = this.parsePositiveInt(this.extractParamValue(params, 'page'), 1);

    this.rows = nextRows;
    this.first = Math.max(0, (nextPage - 1) * nextRows);

    if (this.filterSearchCmp) {
      this.filterSearchCmp.event.rows = this.rows;
      this.filterSearchCmp.event.first = this.first;
    }
  }

  private extractParamValue(record: Record<string, string | string[]>, key: string): string {
    const value = record[key];
    if (Array.isArray(value)) {
      return value[0] ?? '';
    }
    return value ?? '';
  }

  private parsePositiveInt(value: string, fallback: number): number {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return fallback;
    }
    return parsed;
  }

  private resetPaginatorToFirstPage(): void {
    this.first = 0;
    if (this.filterSearchCmp) {
      this.filterSearchCmp.event.first = 0;
    }
  }

  private updateVisibleFaqs(): void {
    const all = (this.faqs() ?? []).slice();
    if (!all.length) {
      this.totalRecords = 0;
      this.filteredFaqs = [];
      this.visibleFaqs = [];
      return;
    }

    all.sort((a, b) => (Number(a.order) - Number(b.order)) || (Number(a.id) - Number(b.id)));

    const keyFilter = this.keyFilter.trim().toLowerCase();
    const featuredFilter = this.featuredFilter;
    const expandedFilter = this.expandedFilter;

    let working = all;
    if (this.searchTerm) {
      const normalizedSearch = this.searchTerm.toLowerCase();
      working = working.filter(item => this.matchesSearchTerm(item, normalizedSearch));
    }
    if (keyFilter) {
      working = working.filter(item => (item.key ?? '').toLowerCase().includes(keyFilter));
    }
    if (featuredFilter) {
      const desired = featuredFilter === 'true';
      working = working.filter(item => this.normalizeBoolean(item.is_featured) === desired);
    }
    if (expandedFilter) {
      const desired = expandedFilter === 'true';
      working = working.filter(item => this.normalizeBoolean(item.is_expanded_by_default) === desired);
    }
    if (this.currentOrdering === '-order') {
      working = working.slice().reverse();
    }

    this.filteredFaqs = working;
    this.totalRecords = working.length;
    if (working.length === 0) {
      this.visibleFaqs = [];
      this.resetPaginatorToFirstPage();
      return;
    }

    const safeRows = this.rows > 0 ? this.rows : env.pagination.defaultPageSize;
    if (this.rows <= 0) {
      this.rows = safeRows;
      if (this.filterSearchCmp) {
        this.filterSearchCmp.event.rows = safeRows;
      }
    }

    const maxFirstAllowed = Math.max(0, Math.floor((working.length - 1) / safeRows) * safeRows);
    if (this.first > maxFirstAllowed) {
      this.first = maxFirstAllowed;
      if (this.filterSearchCmp) {
        this.filterSearchCmp.event.first = maxFirstAllowed;
      }
    }

    this.visibleFaqs = working.slice(this.first, this.first + safeRows);
  }

  private matchesSearchTerm(item: FaqLibraryItem, term: string): boolean {
    const lowerTerm = term.toLowerCase();
    const baseFields = [
      item.key,
      item.internal_identifier,
      (item as any).internal_note,
      (item as any).anchor,
    ];

    if (baseFields.some(field => (field ?? '').toString().toLowerCase().includes(lowerTerm))) {
      return true;
    }

    const translations = item.translations ?? [];
    return translations.some(tx =>
      (tx.question ?? '').toLowerCase().includes(lowerTerm) ||
      (tx.answer ?? '').toLowerCase().includes(lowerTerm)
    );
  }

  private normalizeBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return Boolean(value);
  }
  
  // private fetchLinks(item: any) {
  //   if (!item?.id) return;
  //   this.linkService.getAll({faq_item: Number(item.id)}).subscribe({
  //     next: links => {
  //       // prefer denormalized fields from backend; otherwise keep only ids
  //       item.links = links.results! || [];
  //       // trigger signal update
  //       this.faqs.set(this.faqs().slice());
  //     },
  //     error: () => { /* silent */ }
  //   });
  // }
  

  // selected-language translation (like your BlogImage)
  // getSelectedTranslation(item: FaqLibraryItem): FaqLibraryItemTranslation | null {
  //   const lang = (this.language || 'en').toLowerCase();
  //   const list = item?.translations ?? [];
  //   const exact = list.find(t => (t.language || '').toLowerCase() === lang);
  //   return exact || null;
  // }
  getTranslationByLanguage(translations: any[], language: string): any | null {
    return translations.find(translation => translation.language === language) || null;
  }
  // Create empty item (like createEmpty image)
  addNewEmptyFaq(sectionId: number): void {
    console.log('Adding new empty FAQ to section', sectionId);
    // id?: string;
    // section?: string;
    // order?: string;
    // internal_note?: string;
    // is_expanded_by_default?: string;
    // anchor?: string;
    // is_featured?: string;
    // translations?: FaqLibraryItemTranslation[];
    const nextOrder = (Number(this.faqs()?.at(-1)?.order ?? -1)) + 1;
    this.faqService.create({
      // section: sectionId,
      order: nextOrder,
      is_expanded_by_default: false,
      is_featured: false,
      anchor: ''
    } as any).subscribe({
      next: created => {
        this.faqs.set([...(this.faqs() ?? []), created]);
        this.updateVisibleFaqs();
        this.message.add({ severity: 'success', summary: 'Created', detail: 'New FAQ item created!' });
      },
      error: (err) => {
        console.error(err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to create FAQ item.' });
      }
    });
  }

  openFaqForm(faqToEdit: FaqLibraryItem | null = null): void {
    this.refFaq = this.dialogService.open(FaqLibraryItemFormComponent, {
      header: 'FAQ — Add / Edit',
      styleClass: 'fit-content-dialog',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true,
      data: {
        faqItem: faqToEdit,
      },
      maximizable: true,
      resizable: true
    });

    this.refFaq.onClose.subscribe((saved: FaqLibraryItem) => {
      if (!saved) return;
      this.message.add({ severity: 'success', summary: 'Saved', detail: 'FAQ Library Item saved' });

      const current = [...(this.faqs() ?? [])];
      const idx = current.findIndex(item => Number(item.id) === Number(saved.id));

      if (idx > -1) {
        current[idx] = { ...current[idx], ...saved };
      } else {
        current.push(saved);
      }

      this.faqs.set(current);
      this.updateVisibleFaqs();
    });
  }

  // Delete
  deleteFaq(itemId: string): void {
    if (!confirm(`Delete FAQ #${itemId}?`)) return;
    this.faqService.delete(Number(itemId)).subscribe({
      next: () => {
        const payload = (this.faqs() ?? []).filter(x => Number(x.id) !== Number(itemId));
        // this.section.faqs = payload;
        this.faqs.set(payload);
        // re-order remaining items
        payload.forEach((x, idx) => (x.order = String(idx)));
        // bulk update
        this.faqService.bulkReorder(payload).subscribe();
        this.updateVisibleFaqs();
        this.message.add({ severity: 'success', summary: 'Deleted', detail: 'FAQ removed' });
      },
      error: (e) => {
        console.error(e);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete FAQ.' });
      }
    });
  }

  // Reorder by drag & drop (bulkReorder)
  drop(event: CdkDragDrop<FaqLibraryItem[]>) {
    const all = (this.faqs() ?? []).slice();
    const filtered = this.filteredFaqs ?? [];
    const sourceIndex = this.first + event.previousIndex;
    const targetIndex = this.first + event.currentIndex;
    const movingItem = filtered[sourceIndex];

    if (!movingItem) {
      return;
    }

    const currentAllIndex = all.findIndex(x => Number(x.id) === Number(movingItem.id));
    if (currentAllIndex === -1) {
      return;
    }

    let insertAllIndex: number;
    if (targetIndex >= filtered.length) {
      insertAllIndex = all.length;
    } else {
      const targetItem = filtered[targetIndex];
      insertAllIndex = targetItem ? all.findIndex(x => Number(x.id) === Number(targetItem.id)) : all.length;
    }

    if (insertAllIndex === -1) {
      insertAllIndex = all.length;
    }

    const [removed] = all.splice(currentAllIndex, 1);
    if (insertAllIndex > currentAllIndex) {
      insertAllIndex--;
    }
    all.splice(insertAllIndex, 0, removed);

    all.forEach((row, idx) => (row.order = String(idx)));
    this.faqs.set(all);
    this.updateVisibleFaqs();

    const payload: any = all.map(x => ({ id: x.id, order: x.order }));
    this.faqService.bulkReorder(payload).subscribe({
      next: updated => {
        this.faqs.set(updated);
        this.updateVisibleFaqs();
        this.message.add({ severity: 'success', summary: 'Reordered', detail: 'FAQ order updated' });
      },
      error: () => this.message.add({ severity: 'error', summary: 'Reorder failed', detail: 'Could not reorder FAQs' })
    });
  }

  // Move up/down (single move endpoint)
  moveUp(it: FaqLibraryItem) {
    const newOrder = Math.max(0, Number(it.order) - 1);
    this.move(Number(it.id), newOrder);
  }
  moveDown(it: FaqLibraryItem) {
    const newOrder = Math.min(this.faqs()!.length - 1, Number(it.order) + 1);
    this.move(Number(it.id), newOrder);
  }
  private move(id: number, newOrder: number) {
    this.faqService.move(id, newOrder).subscribe({
      next: () => {
        this.load();
        this.message.add({ severity: 'success', summary: 'Moved', detail: 'FAQ moved' });
      },
      error: () => this.message.add({ severity: 'error', summary: 'Move failed', detail: 'Could not move FAQ' })
    });
  }

  // Open translation form dialog (create or edit)
  openFaqTranslationForm(
    faqItemId: string, 
    translationToEdit: FaqLibraryItemTranslation | null = null, 
    language: string | null = null
  ): void {
    this.refFaqTx = this.dialogService.open(FaqLibraryItemTranslationFormComponent, {
      header: 'FAQ Translation — Add / Edit',
      styleClass: 'fit-content-dialog',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true,
      data: {
        faqItemId: faqItemId,
        translation: translationToEdit,
        preferredLanguage: language
      },
      maximizable: true,
      resizable: true
    });

    this.refFaqTx.onClose.subscribe((saved: FaqLibraryItemTranslation) => {
      if (!saved) return;
      this.message.add({ severity: 'success', summary: 'Saved', detail: 'FAQ translation saved' });

      // merge into local cache (same as your BlogImage detail)
      const list = this.faqs()?.slice();
      const idx = list?.findIndex(x => Number(x.id) === Number(faqItemId));
      if (idx === -1) return;

      const txs = (list![idx!].translations ?? []).slice();
      const tIdx = txs.findIndex(t => t.language === saved.language);
      if (tIdx > -1) txs[tIdx] = saved;
      else txs.push(saved);
      list![idx!] = { ...list![idx!], translations: txs };
      this.faqs.set(list);
      // this.section.faqs = list;
    });
  }

  // Add this method to the class definition
trackById(index: number, item: any): any {
  return item.id;
}


startLink(item: any) {
  this.linkingForId = item.id;
  this.selectedBlog = null;
  this.blogSearchResults = [];
}

cancelLink() {
  this.linkingForId = null;
  this.selectedBlog = null;
  this.blogSearchResults = [];
}

searchBlogs(e: { query: string }) {
  const q = (e?.query || '').trim();
  if (q.length < 2) {
    this.blogSearchResults = [];
    return;
  }
  console.log('Searching blogs for', q);
  this.blogService.getAll(`?search=${q}`).subscribe({
    next: rows => this.blogSearchResults = rows.results! || [],
    error: () => this.blogSearchResults = []
  });
}

confirmLink(item: any) {
  if (!this.selectedBlog) return;
  const payload: BlogPostFaqLink = {
    blog_post: String(this.selectedBlog.id),
    faq_item: String(item.id),
    order: (item.links?.length || 0)
  };
  this.linkService.create(payload).subscribe({
    next: link => {
      // enrich link for display convenience
      link.blog_post_title = this.selectedBlog!.internal_title;

      item.links = [...(item.links || []), link];
      this.faqs.set(this.faqs().slice());
      this.message.add({ severity: 'success', summary: 'Linked', detail: 'FAQ linked with blog post' });
      this.cancelLink();
    },
    error: () => this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to create link' })
  });
}

removeLink(item: any, link: BlogPostFaqLink) {
  if (!confirm('Remove this link?')) return;
  this.linkService.delete(Number(link.id)).subscribe({
    next: () => {
      item.links = (item.links || []).filter((l: any) => Number(l.id) !== Number(link.id));
      this.faqs.set(this.faqs().slice());
      this.message.add({ severity: 'success', summary: 'Removed', detail: 'Link removed' });
    },
    error: () => this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove link' })
  });
}


}
