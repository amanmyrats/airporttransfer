// blog-section-map-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { HttpErrorPrinterService } from '../../../../services/http-error-printer.service';
import { BlogSectionMap } from '../../models/blog-section-map.model';
import { BlogSectionMapService } from '../../services/blog-section-map.service';

@Component({
  selector: 'app-blog-section-map-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    DropdownModule,
    SelectModule,
    MessageModule,
    ToastModule,
  ],
  providers: [HttpErrorPrinterService, MessageService],
  templateUrl: './blog-section-map-form.component.html',
  styleUrl: './blog-section-map-form.component.scss'
})
export class BlogSectionMapFormComponent implements OnInit {
  form!: FormGroup;

  map: BlogSectionMap | null = null;
  sectionId: string | number | null = null;

  providers = [
    { label: 'Google My Maps', value: 'google_my_maps' },
  ];

  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private httpErrorPrinter = inject(HttpErrorPrinterService);
  private msg = inject(MessageService);
  private mapService = inject(BlogSectionMapService);

  ngOnInit(): void {
    this.map = this.config.data?.map ?? null;
    this.sectionId = this.config.data?.sectionId ?? null;

    this.form = this.fb.group({
      // PK equals section id (OneToOne), omit 'id' field for clarity
      section: [this.map?.section ?? this.sectionId ?? null, [Validators.required]],
      provider: [this.map?.provider ?? 'google_my_maps', [Validators.required]],
      internal_identifier: [this.map?.internal_identifier ?? '', []],
      iframe_height: [this.map?.iframe_height ?? 420, []],
      is_active: [this.map?.is_active ?? true, []],
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      this.httpErrorPrinter.printFormErrors(this.form, {
        section: 'Section',
        provider: 'Provider',
      });
      return;
    }

    const payload: Partial<BlogSectionMap> = {
      ...this.form.value,
    };

    if (this.map?.section) {
      this.mapService.update(this.map.section, payload).subscribe({
        next: (res) => {
          this.msg.add({ severity: 'success', summary: 'Saved', detail: 'Map updated.' });
          this.dialogRef.close(res);
        },
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    } else {
      this.mapService.create(payload).subscribe({
        next: (res) => {
          this.msg.add({ severity: 'success', summary: 'Created', detail: 'Map created.' });
          this.dialogRef.close(res);
        },
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    }
  }
}
