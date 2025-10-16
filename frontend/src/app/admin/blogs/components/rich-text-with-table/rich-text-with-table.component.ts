import { Component, forwardRef, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'app-rich-text-with-table',
  imports: [CommonModule, FormsModule, EditorModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextWithTableComponent),
      multi: true
    }
  ],
  templateUrl: './rich-text-with-table.component.html',
  styleUrls: ['./rich-text-with-table.component.scss']
})
export class RichTextWithTableComponent implements ControlValueAccessor, OnInit {
  value = '';
  modules: any = null;
  isBrowser = false;
  disabled = false;
  private quill!: any;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (!this.isBrowser) return;

    const [{ default: Quill }, { default: TableUI }] = await Promise.all([
      import('quill'),
      import('quill-table-ui')
    ]);

    (window as any).Quill = Quill;
    Quill.register('modules/tableUI', TableUI);

    this.modules = {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ table: 'insert' }, { table: 'insert-rows-above' }, { table: 'insert-rows-below' },
         { table: 'insert-columns-left' }, { table: 'insert-columns-right' },
         { table: 'delete-row' }, { table: 'delete-column' }, { table: 'delete-table' }],
        ['clean']
      ],
      table: true,
      tableUI: true
    };
  }

  // keep raw typing; do NOT normalize here
  onModelChange(val: string) {
    this.value = val ?? '';
    this.onChange(this.value);
  }

  writeValue(val: string): void { this.value = val || ''; }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onEditorInit(quillInstance: any) {
    this.quill = quillInstance;

    // optional inline table styling
    const style = document.createElement('style');
    style.innerHTML = `
      .ql-editor table { border-collapse: collapse; width: 100%; }
      .ql-editor th, .ql-editor td { border: 1px solid #ddd; padding: 6px; }
      .ql-editor thead th { background: #f8f8f8; font-weight: 600; }
    `;
    document.head.appendChild(style);
  }

  // normalize only when user leaves the editor (prevents caret jumps)
  // normalizeOnBlur() {
  //   if (!this.isBrowser || !this.quill) return;

  //   const cleaned = this.normalizeHtml(this.value);
  //   if (cleaned !== this.value) {
  //     const sel = this.quill.getSelection(); // preserve caret
  //     this.quill.clipboard.dangerouslyPasteHTML(cleaned, 'silent');
  //     if (sel) this.quill.setSelection(sel.index, sel.length || 0, 'silent');
  //     this.value = cleaned;
  //     this.onChange(this.value);
  //   }
  //   this.onTouched();
  // }

  // private normalizeHtml(html: string): string {
  //   if (!html) return '';
  //   return html
  //     .replace(/\u00A0/g, ' ')     // NBSP char -> space
  //     .replace(/&nbsp;/g, ' ')     // HTML entity -> space
  //     .replace(/[ \t]{2,}/g, ' '); // optional: collapse multiple spaces
  // }
}