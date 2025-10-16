// blog-video-caption-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { BlogVideoTrack } from '../../models/blog-video-track.model';
import { BlogVideoCaptionService } from '../../services/blog-video-caption.service';


@Component({
  selector: 'app-blog-video-caption-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    SelectModule,
    CheckboxModule,
    MessageModule,
    ToastModule,
  ],
  providers: [HttpErrorPrinterService, MessageService],
  templateUrl: './blog-video-caption-form.component.html',
  styleUrl: './blog-video-caption-form.component.scss'
})
export class BlogVideoCaptionFormComponent implements OnInit {
  form!: FormGroup;

  track: BlogVideoTrack | null = null;
  videoId: number | null = null;

  languages = [
    { label: 'English', value: 'en' },
    { label: 'Deutsch', value: 'de' },
    { label: 'Русский', value: 'ru' },
    { label: 'Türkçe', value: 'tr' },
  ];

  kinds = [
    { label: 'Subtitles', value: 'subtitles' },
    { label: 'Captions', value: 'captions' },
    { label: 'Audio Descriptions', value: 'descriptions' },
    { label: 'Chapters', value: 'chapters' },
    { label: 'Metadata', value: 'metadata' },
  ];

  selectedFile: File | null = null;

  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private httpErrorPrinter = inject(HttpErrorPrinterService);
  private msg = inject(MessageService);
  private captionService = inject(BlogVideoCaptionService);

  ngOnInit(): void {
    this.track = this.config.data?.track ?? null;
    this.videoId = this.config.data?.videoId ?? null;

    this.form = this.fb.group({
      id: [this.track?.id ?? null],
      video: [this.videoId, [Validators.required]],
      language: [this.track?.language ?? null, [Validators.required]],
      kind: [this.track?.kind ?? 'subtitles', [Validators.required]],
      label: [this.track?.label ?? ''],
      src: [this.track?.src ?? ''],         // URL alternative to file
      mime_type: [this.track?.['mime_type'] ?? 'text/vtt'],
      is_default: [this.track?.default ?? false],
      // file is handled outside reactive form
    });
  }

  get f() { return this.form.controls; }

  onFileChange(evt: Event) {
    const input = evt.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      this.httpErrorPrinter.printFormErrors(this.form, {
        video: 'Video',
        language: 'Language',
        kind: 'Kind',
        label: 'Label',
        src: 'Source URL',
      });
      return;
    }

    const id = this.form.value.id as number | null;

    // If a file is chosen, send FormData (service accepts FormData fine)
    if (this.selectedFile) {
      const fd = new FormData();
      fd.append('video', String(this.form.value.video));
      fd.append('language', this.form.value.language);
      fd.append('kind', this.form.value.kind);
      if (this.form.value.label) fd.append('label', this.form.value.label);
      fd.append('file', this.selectedFile, this.selectedFile.name);
      if (this.form.value.mime_type) fd.append('mime_type', this.form.value.mime_type);
      fd.append('is_default', String(!!this.form.value.is_default));

      if (id) {
        this.captionService.update(id, fd as any).subscribe({
          next: (res) => {
            this.msg.add({ severity: 'success', summary: 'Saved', detail: 'Track updated.' });
            this.dialogRef.close(res);
          },
          error: (err) => this.httpErrorPrinter.printHttpError(err),
        });
      } else {
        this.captionService.create(fd as any).subscribe({
          next: (res) => {
            this.msg.add({ severity: 'success', summary: 'Created', detail: 'Track created.' });
            this.dialogRef.close(res);
          },
          error: (err) => this.httpErrorPrinter.printHttpError(err),
        });
      }
      return;
    }

    // Otherwise, JSON payload (URL-only track)
    const payload: Partial<BlogVideoTrack> = {
      video: this.form.value.video,
      language: this.form.value.language,
      kind: this.form.value.kind,
      label: this.form.value.label,
      src: this.form.value.src,
      mime_type: this.form.value.mime_type,
      default: this.form.value.is_default,
    };

    if (id) {
      this.captionService.update(id, payload).subscribe({
        next: (res) => {
          this.msg.add({ severity: 'success', summary: 'Saved', detail: 'Track updated.' });
          this.dialogRef.close(res);
        },
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    } else {
      this.captionService.create(payload).subscribe({
        next: (res) => {
          this.msg.add({ severity: 'success', summary: 'Created', detail: 'Track created.' });
          this.dialogRef.close(res);
        },
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    }
  }
}
