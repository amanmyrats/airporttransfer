import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorPrinterService {

  constructor(
    private messageService: MessageService, 
    // private translateService?: TranslateService
  ) {} // Inject messageService and optional translateService

  public printHttpError(err: any): void {
    console.log("HttpErrorPrinterService.printHttpError()");
    console.log(err);
    this.messageService.clear();
    if (err.error) {
      for (const [key, value] of Object.entries(err.error)) {
        // const translatedKey = this.translateKey(key); // Optional translation
        // const translatedValue = this.translateValue(value); // Optional translation
        const string_value = value!.toString();

        const is_failed_login = string_value.toLowerCase().includes('no active account'.toLowerCase());
        if (is_failed_login) {
          this.messageService.add({ severity: 'error', summary: key, detail: 'E-Posta veya şifre hatalı.' });
        } else {
          this.messageService.add({ severity: 'error', summary: key, detail: value as string });
        }

      }
    } else {
      console.error('Beklenmedik hata:', err);
      this.messageService.add({ severity: 'error', summary: 'Unexpected Error', detail: 'An unexpected error occurred.' }); // Default error message
    }
  }


  /** NEW: simple validator-to-toast mapper */
  printFormErrors(form: FormGroup, labels: Record<string, string> = {}): void {
    this.messageService.clear();

    const add = (summary: string, detail: string) =>
      this.messageService.add({ severity: 'error', summary, detail });

    let any = false;
    Object.entries(form.controls).forEach(([key, control]) => {
      if (!control.errors) return;
      any = true;
      const label = labels[key] ?? this.pretty(key);
      const e = control.errors;

      if (e['required'])        add(label, `${label} is required.`);
      if (e['minlength'])       add(label, `Min length is ${e['minlength'].requiredLength}.`);
      if (e['maxlength'])       add(label, `Max length is ${e['maxlength'].requiredLength}.`);
      if (e['pattern'])         add(label, `Invalid format.`);
      if (e['min'] !== undefined) add(label, `Minimum value is ${e['min'].min}.`);
      if (e['max'] !== undefined) add(label, `Maximum value is ${e['max'].max}.`);
      if (e['email'])           add(label, `Enter a valid email.`);
      // add more mappings as needed
    });

    if (!any) {
      add('Form', 'Please fix the highlighted errors.');
    }
  }

  private pretty(key: string) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}