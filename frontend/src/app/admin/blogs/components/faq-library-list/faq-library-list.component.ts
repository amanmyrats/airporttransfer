import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
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

  ],
  providers: [DialogService, MessageService],
  templateUrl: './faq-library-list.component.html',
  styleUrl: './faq-library-list.component.scss'
})
export class FaqLibraryListComponent implements OnInit {

  faqs = signal<FaqLibraryItem[]>([]);
  private linkService = inject(BlogPostFaqLinkService);
  private blogService = inject(BlogPostService);

  private faqService = inject(FaqLibraryItemService);
  private faqTxService = inject(FaqLibraryItemTranslationService);
  private dialogService = inject(DialogService);
  private message = inject(MessageService);


  // link UI state
  linkingForId: string | null = null;
  blogSearchResults: BlogPost[] = [];
  selectedBlog: BlogPost | null = null;

  refFaq?: DynamicDialogRef;
  refFaqTx?: DynamicDialogRef;

  // state
  loading = signal(false);

  ordered = computed(() =>
    this.faqs().slice().sort((a, b) => (Number(a.order) - Number(b.order)) || (Number(a.id) - Number(b.id)))
  );

  ngOnInit(): void {
    this.load();
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
  
        // fetch links per item
        // rows.forEach((it: any) => this.fetchLinks(it));
      },
      error: () => {
        this.loading.set(false);
        this.message.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load FAQ items' });
      }
    });
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
    const arr = this.faqs()!;
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    arr.forEach((row, idx) => (row.order = String(idx)));
    this.faqs.set(arr);
    // this.section.faqs = arr;


    const payload: any = arr.map(x => ({ id: x.id, order: x.order }));
    this.faqService.bulkReorder(payload).subscribe({
      next: updated => {
        this.faqs.set(updated);
        // this.section.faqs = updated;
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
