import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'decodeHtml'
})
export class DecodeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(v: string | null | undefined): SafeHtml {
    const txt = document.createElement('textarea');
    txt.innerHTML = (v ?? '');
    const decoded = txt.value;          // "&lt;div&gt;" -> "<div>"
    return this.sanitizer.bypassSecurityTrustHtml(decoded);
  }
}
