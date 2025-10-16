import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadModule } from 'primeng/fileupload';
import { RouterModule } from '@angular/router';
import { BlogPostService } from '../../services/blog-post.service';
import { BlogCategoryService } from '../../services/blog-category.service';
import { BlogTagService } from '../../services/blog-tag.service';
import { BlogTag } from '../../models/blog-tag.model';
import { BlogCategory } from '../../models/blog-category.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BlogPost } from '../../models/blog-post.model';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { ToastModule } from "primeng/toast";
import { HttpErrorPrinterService } from '../../../../services/http-error-printer.service';
import { PaginatedResponse } from '../../../../models/paginated-response.model';


@Component({
  selector: 'app-blog-post-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    TextareaModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    MultiSelectModule,
    FileUploadModule,
    RouterModule,
    SelectModule,
    MessageModule,
    ToastModule, 
],
  providers: [
      HttpErrorPrinterService, MessageService, 
  ],
  templateUrl: './blog-post-form.component.html',
  styleUrl: './blog-post-form.component.scss'
})
export class BlogPostFormComponent implements OnInit {
  form!: FormGroup;
  tagSearchSubject = new Subject<string>();

  isTagLoading: boolean = false;

  languages = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'German' },
    { code: 'ru', label: 'Russian' },
    { code: 'tr', label: 'Turkish' }
  ];

  categories: BlogCategory[] = [];

  blogPost: BlogPost | null = null;
  tags: BlogTag[] = [];

  uploadedImageUrl: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private blogPostService: BlogPostService, 
    private categoryService: BlogCategoryService,
    private tagService: BlogTagService,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private httpErrorPrinter: HttpErrorPrinterService, 
  ) {}

  ngOnInit(): void {
    
    this.form = this.fb.group({
      id: [null],
      internal_title: ['', Validators.required],
      // slug: ['', Validators.required],
      published_at: [null],
      is_published: [false],
      featured: [false],
      priority: [0],
      is_translated_fully: [false],
      category: [null],
      tags: [[]],
      author: [''],
      slug_locked: [false],
    });

    this.blogPost = this.config.data?.blogPost || null;
    if (this.blogPost) {
      console.log('Editing blog post:', this.blogPost);
      this.form.patchValue(this.blogPost);
      this.uploadedImageUrl = this.blogPost.main_image || null;
       // Only now patch the value
       if (this.blogPost?.category) {
        this.form.patchValue({
          category: {id: this.blogPost.category, name: 'travel'}
        });
      }
    }

    // Handle debounced search
    this.tagSearchSubject.pipe(
      debounceTime(500), // Wait 500ms after user stops typing
      distinctUntilChanged(), // Avoid duplicate consecutive requests
    ).subscribe(queryString => this.getTags(queryString = `?search=${queryString}`));

    // Fetch initial categories and tags
    this.getCategories();
    this.getTags();
  }

  submit(): void {
    this.form.patchValue({
      category: this.form.value.category?.id || null,
    });
    this.form.markAllAsTouched();

    if (this.form.valid) {
      console.log('Form Data:', this.form.value);
      
        // create(post: Partial<BlogPost>): Observable<BlogPost> {
        //   return this.http.post<BlogPost>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, post);
        // }
        if (this.blogPost) {
          // Update existing blog post
          this.blogPostService.update(this.blogPost.id!, this.form.value).subscribe({
            next: (response) => {
              console.log('Blog post updated successfully:', response);
              // Optionally reset the form or navigate to another page
              this.form.reset();
              this.uploadedImageUrl = null;
              this.dialogRef.close(response);
            },
            error: (error) => {
              console.error('Error updating blog post:', error);
              // Handle error, show message, etc.
              this.httpErrorPrinter.printHttpError(error);
            }
          });
          return;
        } else {
      // Create new blog post
      this.blogPostService.create(this.form.value).subscribe({
        next: (response) => {
          console.log('Blog post created successfully:', response);
          // Optionally reset the form or navigate to another page
          this.form.reset();
          this.uploadedImageUrl = null;
          this.dialogRef.close(response);

        },
        error: (error) => {
          console.error('Error creating blog post:', error);
          // Handle error, show message, etc.
        this.httpErrorPrinter.printHttpError(error);
        }
      });
    }} 
    else {
      console.log('Form is invalid');
      console.log(this.form.errors);
      this.form.markAllAsTouched();

      this.httpErrorPrinter.printFormErrors(this.form, {
        internal_title: 'Internal Title',
        slug: 'Slug',
        priority: 'Priority',
        // add labels for any controls you want pretty names for
      });
    }
  }

  get f() {
    return this.form.controls;
  }

  getCategories(queryString: string = ''): void {
    this.categoryService.getAll(queryString).subscribe({
      next: (categories: PaginatedResponse<BlogCategory>) => {
        this.categories = categories.results!;
        console.log('Categories fetched successfully:', this.categories);
        // Now patch category value
      if (this.blogPost?.category_obj) {
        // add category_obj to categories
        this.categories = this.categories.map(cat => {
          if (cat.id === this.blogPost?.category_obj?.id) {
            return { ...cat, name: this.blogPost?.category_obj?.name };
          }
          return cat;
        });
        this.form.patchValue({
          category: this.blogPost.category_obj
        });
      }
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  getTags(queryString: string = ''): void {
    this.isTagLoading = true;
    this.tagService.getAll(queryString).subscribe({
      next: (tags: PaginatedResponse<BlogTag>) => {
        this.tags = tags.results!;
        this.isTagLoading = false;
      },
      error: (error) => {
        console.error('Error fetching tags:', error);
        this.isTagLoading = false;
      }
    });
  }



  onTagSearchChange(event: any) {
    const query = event.filter.trim().toLowerCase();

    if (query.length === 0) {
      this.tags = this.tags;
      return;
    }
    // Emit search query to Subject
    this.tagSearchSubject.next(query);
  }

}
