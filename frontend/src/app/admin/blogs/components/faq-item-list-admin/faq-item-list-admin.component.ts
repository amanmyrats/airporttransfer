import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { FaqItemTranslationService } from '../../services/faq-item-translation.service';
import { BlogSection } from '../../models/blog-section.model';
import { FaqItemService } from '../../services/faq-item.service';
import { FaqItem } from '../../models/faq-item.model';
import { FaqItemTranslation } from '../../models/faq-item-translation.model';
import { FaqItemTranslationFormComponent } from '../faq-item-translation-form/faq-item-translation-form.component';
import { FaqItemFormComponent } from '../faq-item-form/faq-item-form.component';
import { BlogPostFaqLink } from '../../models/blog-post-faq-link.model';
import { FaqLibraryItem } from '../../models/faq-library-item.model';

@Component({
  selector: 'app-faq-item-list-admin',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [DialogService, MessageService],
  templateUrl: './faq-item-list-admin.component.html',
  styleUrl: './faq-item-list-admin.component.scss'
})
export class FaqItemListAdminComponent implements OnInit {
  @Input({ required: true }) faq_links: BlogPostFaqLink[] = [];
  @Input({ required: true }) section!: BlogSection;
  @Input({ required: true }) language: string = 'en';

  private faqService = inject(FaqItemService);
  private faqTxService = inject(FaqItemTranslationService);
  private dialogService = inject(DialogService);
  private message = inject(MessageService);

  refFaq?: DynamicDialogRef;
  refFaqTx?: DynamicDialogRef;

  // state
  loading = signal(false);

  // ordered = computed(() =>
  //   this.faqs().slice().sort((a, b) => (a.order - b.order) || (a.id - b.id))
  // );

  ngOnInit(): void {
    // this.load();
  }

  load(): void {
    if (!this.section?.id) return;
    this.loading.set(true);
    this.faqService.getAll({ section: this.section.id, ordering: 'order' }).subscribe({
      next: res => {
        // this.faqs.set(res ?? []);
        this.section.faqs = res ?? [];
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.message.add({ severity: 'error', summary: 'Load failed', detail: 'Could not load FAQ items' });
      }
    });
  }

  // selected-language translation (like your BlogImage)
  getSelectedTranslation(item: FaqItem | FaqLibraryItem): FaqItemTranslation | null {
    const lang = (this.language || 'en').toLowerCase();
    const list = item?.translations ?? [];
    const exact = list.find(t => (t.language || '').toLowerCase() === lang);
    return exact || null;
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
    // translations?: FaqItemTranslation[];
    const nextOrder = (Number(this.section.faqs?.at(-1)?.order ?? -1)) + 1;
    this.faqService.create({
      section: sectionId,
      order: nextOrder,
      is_expanded_by_default: false,
      is_featured: false,
      anchor: ''
    } as any).subscribe({
      next: created => {
        this.section.faqs = [...(this.section.faqs ?? []), created];
        this.message.add({ severity: 'success', summary: 'Created', detail: 'New FAQ item created!' });
      },
      error: (err) => {
        console.error(err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to create FAQ item.' });
      }
    });
  }

  openFaqForm(faqToEdit: FaqItem | null = null): void {
    this.refFaq = this.dialogService.open(FaqItemFormComponent, {
      header: 'FAQ — Add / Edit',
      styleClass: 'fit-content-dialog',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true,
      data: {
        faqItem: faqToEdit,
        sectionId: this.section?.id, 
      },
      maximizable: true,
      resizable: true
    });

    this.refFaq.onClose.subscribe((saved: FaqItem) => {
      if (!saved) return;
      this.message.add({ severity: 'success', summary: 'Saved', detail: 'FAQ Item saved' });

      // merge into local cache (same as your BlogImage detail)
      const list = this.section.faqs?.slice();
      const idx = list?.findIndex(x => Number(x.id) === Number(faqToEdit?.id));
      if (idx === -1) {
        list?.push(saved);
        return;
      }

      list![idx!] = { ...list![idx!]};
      // this.faqs.set(list);
      this.section.faqs = list;
    });
  }

  // Delete
  deleteFaq(itemId: string): void {
    if (!confirm(`Delete FAQ #${itemId}?`)) return;
    this.faqService.delete(itemId).subscribe({
      next: () => {
        const payload = (this.section.faqs ?? []).filter(x => Number(x.id) !== Number(itemId));
        this.section.faqs = payload;
        // re-order remaining items
        payload.forEach((x, idx) => (x.order = String(idx)));
        // bulk update
        this.faqService.bulkReorder(this.section.id!, payload).subscribe();
        this.message.add({ severity: 'success', summary: 'Deleted', detail: 'FAQ removed' });
      },
      error: (e) => {
        console.error(e);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete FAQ.' });
      }
    });
  }

  // Reorder by drag & drop (bulkReorder)
  drop(event: CdkDragDrop<FaqItem[]>) {
    const arr = this.section.faqs!;
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    arr.forEach((row, idx) => (row.order = String(idx)));
    //this.faqs.set(arr);
    this.section.faqs = arr;


    const payload = arr.map(x => ({ id: x.id, order: x.order }));
    this.faqService.bulkReorder(this.section.id!, payload).subscribe({
      next: updated => {
        // this.faqs.set(updated);
        this.section.faqs = updated;
        this.message.add({ severity: 'success', summary: 'Reordered', detail: 'FAQ order updated' });
      },
      error: () => this.message.add({ severity: 'error', summary: 'Reorder failed', detail: 'Could not reorder FAQs' })
    });
  }

  // Move up/down (single move endpoint)
  moveUp(it: FaqItem) {
    const newOrder = Math.max(0, Number(it.order) - 1);
    this.move(Number(it.id), newOrder);
  }
  moveDown(it: FaqItem) {
    const newOrder = Math.min(this.section.faqs!.length - 1, Number(it.order) + 1);
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
  openFaqTranslationForm(faqItemId: string, translationToEdit: FaqItemTranslation | null = null): void {
    this.refFaqTx = this.dialogService.open(FaqItemTranslationFormComponent, {
      header: 'FAQ Translation — Add / Edit',
      styleClass: 'fit-content-dialog',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true,
      data: {
        faqItemId: faqItemId,
        translation: translationToEdit,
        preferredLanguage: this.language
      },
      maximizable: true,
      resizable: true
    });

    this.refFaqTx.onClose.subscribe((saved: FaqItemTranslation) => {
      if (!saved) return;
      this.message.add({ severity: 'success', summary: 'Saved', detail: 'FAQ translation saved' });

      // merge into local cache (same as your BlogImage detail)
      const list = this.section.faqs?.slice();
      const idx = list?.findIndex(x => Number(x.id) === Number(faqItemId));
      if (idx === -1) return;

      const txs = (list![idx!].translations ?? []).slice();
      const tIdx = txs.findIndex(t => t.language === saved.language);
      if (tIdx > -1) txs[tIdx] = saved;
      else txs.push(saved);
      list![idx!] = { ...list![idx!], translations: txs };
      // this.faqs.set(list);
      this.section.faqs = list;
    });
  }

  // Add this method to the class definition
trackById(index: number, item: any): any {
  return item.id;
}

}
