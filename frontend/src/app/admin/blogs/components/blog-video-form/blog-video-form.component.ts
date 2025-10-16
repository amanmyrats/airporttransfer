// blog-video-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
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
import { BlogVideo } from '../../models/blog-video.model';
import { BlogVideoService } from '../../services/blog-video.service';


@Component({
  selector: 'app-blog-video-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    DropdownModule,
    SelectModule,
    MessageModule,
    ToastModule,
  ],
  providers: [HttpErrorPrinterService, MessageService],
  templateUrl: './blog-video-form.component.html',
  styleUrl: './blog-video-form.component.scss'
})
export class BlogVideoFormComponent implements OnInit {
  form!: FormGroup;

  video: BlogVideo | null = null;
  sectionId: string | null = null;

  providers = [
    { label: 'YouTube', value: 'youtube' },
    { label: 'Vimeo', value: 'vimeo' },
    { label: 'Self-hosted', value: 'self' },
    { label: 'Other', value: 'other' },
  ];

  preloadOptions = [
    { label: 'metadata', value: 'metadata' },
    { label: 'auto', value: 'auto' },
    { label: 'none', value: 'none' },
  ];

  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private httpErrorPrinter = inject(HttpErrorPrinterService);
  private msg = inject(MessageService);
  private videoService = inject(BlogVideoService);

  
  ngOnInit(): void {
    this.video = this.config.data?.video ?? null;
    this.sectionId = this.config.data?.sectionId ?? null;

    this.form = this.fb.group({
      id: [this.video?.id ?? null],
      // ensure string FK
      section: [this.video?.section ?? this.sectionId ?? null, [Validators.required]],

      provider: [this.video?.provider ?? 'youtube', [Validators.required]],
      // FIX: provider_video_id source
      provider_video_id: [this.video?.provider_video_id ?? ''],
      source_url: [this.video?.source_url ?? ''],

      // cleaner dot access
      hls_url: [this.video?.hls_url ?? ''],
      dash_url: [this.video?.dash_url ?? ''],

      poster: [''], // UI-only

      width: [this.video?.width ?? null],
      height: [this.video?.height ?? null],
      duration_seconds: [this.video?.duration_seconds ?? null],
      mime_type: [this.video?.mime_type ?? ''],

      autoplay: [this.video?.autoplay ?? false],
      muted: [this.video?.muted ?? false],
      loop: [this.video?.loop ?? false],
      controls: [this.video?.controls ?? true],
      playsinline: [this.video?.playsinline ?? true],
      preload: [this.video?.preload ?? 'metadata'],

      // FIX: start_at source
      start_at: [this.video?.start_at ?? null],
      end_at: [this.video?.end_at ?? null],

      // REMOVE: is_primary (no longer used)
      // is_primary: [false],
    });

    this.setupProviderValidation();
  }

  get f() { return this.form.controls; }

  setupProviderValidation() {
    this.form.get('provider')?.valueChanges.subscribe(() => this.applyProviderRules());
    this.applyProviderRules();
  }

  applyProviderRules() {
    const provider = this.form.get('provider')?.value;
    const providerVideoId = this.form.get('provider_video_id');

    providerVideoId?.clearValidators();

    if (provider === 'youtube' || provider === 'vimeo') {
      providerVideoId?.addValidators([Validators.required]);
    } else {
      // Optional: clear YT/Vimeo-only value when switching away
      if (providerVideoId?.value) providerVideoId.setValue('');
    }

    providerVideoId?.updateValueAndValidity();
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      this.httpErrorPrinter.printFormErrors(this.form, {
        section: 'Section',
        provider: 'Provider',
        provider_video_id: 'Video ID',
        source_url: 'Source URL',
      });
      return;
    }

    const payload: Partial<BlogVideo> = {
      ...this.form.value,
    };
    // cleanup UI-only fields
    delete (payload as any).poster;

    if (this.video?.id) {
      this.videoService.update(this.video.id, payload).subscribe({
        next: (res) => {
          this.msg.add({ severity: 'success', summary: 'Saved', detail: 'Video updated.' });
          this.dialogRef.close(res);
        },
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    } else {
      this.videoService.create(payload).subscribe({
        next: (res) => {
          this.msg.add({ severity: 'success', summary: 'Created', detail: 'Video created.' });
          this.dialogRef.close(res);
        },
        error: (err) => this.httpErrorPrinter.printHttpError(err),
      });
    }
  }

  onPosterSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !this.video?.id) return;
    const file = input.files[0];
    this.videoService.uploadPoster(this.video.id, file).subscribe({
      next: (res) => {
        this.msg.add({ severity: 'success', summary: 'Poster', detail: 'Poster uploaded.' });
      },
      error: (err) => this.httpErrorPrinter.printHttpError(err),
    });
  }
}
