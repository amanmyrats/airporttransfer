import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserService } from '../../services/user.service';
import { MessagesModule } from 'primeng/messages';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Role } from '../../models/role.model';
import { RoleService } from '../../services/role.service';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { FormErrorPrinterService } from '../../../services/form-error-printer.service';
import { PaginatedResponse } from '../../../models/paginated-response.model';

@Component({
    selector: 'app-user-form',
    imports: [
        PanelModule, CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MessagesModule,
        ButtonModule,
        InputTextModule,
        Select, 
        FloatLabel, 
    ],
    providers: [
        HttpErrorPrinterService,
        FormErrorPrinterService,
    ],
    templateUrl: './user-form.component.html',
    styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit{

  userForm: FormGroup;
  user: User | null = null;
  roles: any[] = [];
  isSaving: boolean = false;
  submitError = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private userService: UserService,
    private roleService: RoleService,
    private httpErrorPrinter: HttpErrorPrinterService, 
    private formErrorPrinter: FormErrorPrinterService,
  ) { 
    this.userForm = this.fb.group({
      email: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: [''],
      phone: ['', [Validators.required, Validators.pattern('^\\+[1-9]\\d{1,14}$')]],
      role: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getRoles();
    this.user = this.config.data.user;
    if (this.user) {
      this.userForm.patchValue(this.user);
    }
  }

  submitForm() {
    this.submitError = '';
    if (this.userForm.valid) {
      this.isSaving = true;
      if (this.user) {
        console.log('Updating user:', this.userForm.value);
        this.userService.updateUser(this.user?.id!, this.userForm.value).subscribe({
          next: (user) => {
            console.log('User updated:', user);
            this.isSaving = false;
            this.dialogRef.close(user);
          },
          error: (err: HttpErrorResponse) => {
            this.httpErrorPrinter.printHttpError(err);
            this.submitError = this.extractErrorMessage(err);
            this.isSaving = false;
          }
        });
      } else {
        this.userService.createUser(this.userForm.value).subscribe({
          next: (user) => {
            console.log('User created:', user);
            this.isSaving = false;
            this.dialogRef.close(user);
          },
          error: (err: HttpErrorResponse) => {
            console.log(err);
            this.httpErrorPrinter.printHttpError(err);
            this.submitError = this.extractErrorMessage(err);
            this.isSaving = false;
          }
        });
    }
    } else {
      this.formErrorPrinter.printFormValidationErrors(this.userForm);
      this.submitError = 'Lutfen gerekli alanlari kontrol edin.';
      this.isSaving = false;
    }
  }

  getRoles(queryString: string = '') {
    this.userService.getRoleChoices(queryString).subscribe({
      next: (roles: any[]) => {
        this.roles = roles;
        console.log("Successfully fetched roles");
        console.log(roles);
      },
      error: (error: any) => {
        console.log("Error happened when fetching roles.");
        console.log(error);
      }
    });
  }

  private extractErrorMessage(err: HttpErrorResponse): string {
    const fallback = 'Kaydetme islemi basarisiz.';
    const payload = err?.error;
    if (!payload) {
      return fallback;
    }
    if (typeof payload === 'string') {
      return payload;
    }
    if (payload.detail) {
      return String(payload.detail);
    }
    if (Array.isArray(payload)) {
      return payload.join(' ');
    }
    if (typeof payload === 'object') {
      const [firstKey] = Object.keys(payload);
      if (firstKey) {
        const value = payload[firstKey];
        if (Array.isArray(value)) {
          return `${firstKey}: ${value.join(' ')}`;
        }
        return `${firstKey}: ${String(value)}`;
      }
    }
    return fallback;
  }
}
