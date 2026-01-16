import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { PaymentMethod } from '../../../../payment/models/payment.models';
import {
  PaymentBankAccount,
  PaymentBankAccountFilters,
  PaymentBankAccountPayload,
} from '../../models/bank-account.model';
import { BankAccountService } from '../../services/bank-account.service';
import { FilterSearchComponent } from '../../../components/filter-search/filter-search.component';
import { CommonService } from '../../../../services/common.service';
import { ActionButtonsComponent } from '../../../components/action-buttons/action-buttons.component';
import { PaginatedResponse } from '../../../../models/paginated-response.model';
import { SharedPaginatorComponent } from '../../../components/shared-paginator/shared-paginator.component';
import { environment as env } from '../../../../../environments/environment';

type DialogMode = 'create' | 'edit';

@Component({
  selector: 'app-bank-accounts',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    InputSwitchModule,
    ToastModule,
    ConfirmDialogModule,
    FilterSearchComponent,
    ActionButtonsComponent,
    SharedPaginatorComponent,
  ],
  templateUrl: './bank-accounts.component.html',
  styleUrls: ['./bank-accounts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService, ConfirmationService],
})
export class BankAccountsComponent implements OnInit {
  @ViewChild(FilterSearchComponent) filterSearch?: FilterSearchComponent;

  private readonly service = inject(BankAccountService);
  private readonly fb = inject(FormBuilder);
  private readonly messages = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly commonService = inject(CommonService);

  canManage = false;
  readonly accounts = signal<PaymentBankAccount[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly dialogVisible = signal(false);
  readonly dialogMode = signal<DialogMode>('create');
  readonly formSubmitting = signal(false);
  readonly editingAccount = signal<PaymentBankAccount | null>(null);
  readonly totalRecords = signal(0);
  first = 0;
  rows = env.pagination.defaultPageSize;

  readonly methodOptions = [
    { label: 'Bank Transfer', value: 'BANK_TRANSFER' as PaymentMethod },
    { label: 'Phone Transfer (RU)', value: 'RUB_PHONE_TRANSFER' as PaymentMethod },
  ];

  readonly currencyOptions = ['EUR', 'USD', 'RUB', 'GBP'].map(code => ({
    label: code,
    value: code,
  }));

  readonly statusOptions = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' },
  ];

  readonly filters = signal<PaymentBankAccountFilters>({});

  readonly dialogTitle = computed(() =>
    this.dialogMode() === 'create' ? 'Add Bank Profile' : 'Edit Bank Profile',
  );

  readonly accountForm: FormGroup = this.fb.group({
    label: ['', Validators.required],
    method: ['BANK_TRANSFER', Validators.required],
    currency: ['', [Validators.required, Validators.maxLength(3)]],
    account_name: ['', Validators.required],
    bank_name: [''],
    iban: [''],
    account_number: [''],
    swift_code: [''],
    branch_code: [''],
    phone_number: [''],
    reference_hint: [''],
    priority: [0],
    is_active: [true],
  });

  ngOnInit(): void {
    this.canManage = this.resolveCanManage();
    void this.loadAccounts();
  }

  async loadAccounts(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const filters = this.filters();
      const response = await firstValueFrom(
        this.service.list({
          ...filters,
          page: filters.page ?? 1,
          page_size: filters.page_size ?? this.rows,
        }),
      );
      const accounts = this.normalizePaginatedResults(response);
      this.totalRecords.set(this.resolveTotalCount(response, accounts.length));
      this.accounts.set(accounts);
    } catch (error) {
      console.error('Failed to load bank accounts', error);
      this.error.set('Unable to load bank accounts.');
    } finally {
      this.loading.set(false);
    }
  }

  openCreateDialog(): void {
    if (!this.canManage) {
      return;
    }
    this.dialogMode.set('create');
    this.editingAccount.set(null);
    this.accountForm.reset({
      label: '',
      method: 'BANK_TRANSFER',
      currency: '',
      account_name: '',
      bank_name: '',
      iban: '',
      account_number: '',
      swift_code: '',
      branch_code: '',
      phone_number: '',
      reference_hint: '',
      priority: 0,
      is_active: true,
    });
    this.dialogVisible.set(true);
  }

  onFilterSearch(queryString: string): void {
    const nextFilters = this.extractFilters(queryString);
    this.filters.set(nextFilters);
    this.syncPaginationFromFilters();
    void this.loadAccounts();
  }

  private extractFilters(queryString: string): PaymentBankAccountFilters {
    const params = this.commonService.parseQueryParams(queryString);
    const methodParam = params['method'];
    const method =
      typeof methodParam === 'string' && methodParam ? (methodParam as PaymentMethod) : null;

    const currencyParam = params['currency'];
    const currency =
      typeof currencyParam === 'string' && currencyParam ? currencyParam.toUpperCase() : null;

    const statusParam = params['status'];
    let is_active: boolean | null = null;
    if (statusParam === 'true') {
      is_active = true;
    } else if (statusParam === 'false') {
      is_active = false;
    }
    const page = this.parseNumberParam(params['page'], 1);
    const pageSize = this.parseNumberParam(params['page_size'], this.rows);

    return {
      method,
      currency,
      is_active,
      page,
      page_size: pageSize,
    };
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? this.rows;
    if (this.filterSearch) {
      this.filterSearch.event.first = this.first;
      this.filterSearch.event.rows = this.rows;
      this.filterSearch.search();
    } else {
      const page = Math.floor(this.first / this.rows) + 1;
      this.filters.set({ ...this.filters(), page, page_size: this.rows });
      void this.loadAccounts();
    }
  }

  openEditDialog(account: PaymentBankAccount): void {
    if (!this.canManage) {
      return;
    }
    this.dialogMode.set('edit');
    this.editingAccount.set(account);
    this.accountForm.reset({
      label: account.label,
      method: account.method,
      currency: account.currency,
      account_name: account.account_name,
      bank_name: account.bank_name,
      iban: account.iban,
      account_number: account.account_number,
      swift_code: account.swift_code,
      branch_code: account.branch_code,
      phone_number: account.phone_number,
      reference_hint: account.reference_hint,
      priority: account.priority,
      is_active: account.is_active,
    });
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
    this.formSubmitting.set(false);
    this.editingAccount.set(null);
    this.accountForm.reset();
  }

  async submitAccount(): Promise<void> {
    if (!this.canManage) {
      return;
    }
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }
    this.formSubmitting.set(true);
    const payload = this.buildPayload();
    try {
      if (this.dialogMode() === 'create') {
        await firstValueFrom(this.service.create(payload));
        this.messages.add({
          severity: 'success',
          summary: 'Profile created',
          detail: 'Bank profile created successfully.',
        });
      } else {
        const account = this.editingAccount();
        if (!account) {
          return;
        }
        await firstValueFrom(this.service.update(account.id, payload));
        this.messages.add({
          severity: 'success',
          summary: 'Profile updated',
          detail: 'Bank profile updated successfully.',
        });
      }
      this.dialogVisible.set(false);
      await this.loadAccounts();
    } catch (error) {
      console.error('Failed to save bank profile', error);
      this.messages.add({
        severity: 'error',
        summary: 'Save failed',
        detail: 'Unable to save bank profile. Please check inputs and try again.',
      });
    } finally {
      this.formSubmitting.set(false);
    }
  }

  confirmDeleteById(accountId: number): void {
    if (!this.canManage) {
      return;
    }
    const account = this.accounts().find(item => item.id === accountId);
    if (!account) {
      return;
    }
    this.confirmDelete(account);
  }

  confirmDelete(account: PaymentBankAccount): void {
    if (!this.canManage) {
      return;
    }
    this.confirmation.confirm({
      message: `Delete bank profile "${account.label}"?`,
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => void this.deleteAccount(account),
    });
  }

  private async deleteAccount(account: PaymentBankAccount): Promise<void> {
    if (!this.canManage) {
      return;
    }
    try {
      await firstValueFrom(this.service.delete(account.id));
      this.messages.add({
        severity: 'success',
        summary: 'Profile deleted',
        detail: `Removed "${account.label}".`,
      });
      await this.loadAccounts();
    } catch (error) {
      console.error('Failed to delete bank profile', error);
      this.messages.add({
        severity: 'error',
        summary: 'Delete failed',
        detail: 'Unable to delete bank profile. It may still be in use.',
      });
    }
  }

  controlInvalid(controlName: string): boolean {
    const control = this.accountForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private buildPayload(): PaymentBankAccountPayload {
    const value = this.accountForm.getRawValue();
    return {
      label: value.label?.trim() ?? '',
      method: value.method,
      currency: (value.currency ?? '').toUpperCase(),
      account_name: value.account_name?.trim() ?? '',
      bank_name: value.bank_name?.trim() || '',
      iban: value.iban?.trim() || '',
      account_number: value.account_number?.trim() || '',
      swift_code: value.swift_code?.trim() || '',
      branch_code: value.branch_code?.trim() || '',
      phone_number: value.phone_number?.trim() || '',
      reference_hint: value.reference_hint?.trim() || '',
      priority: Number(value.priority) || 0,
      is_active: !!value.is_active,
    };
  }

  private resolveCanManage(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    const role = (localStorage.getItem('roleName') ?? '').trim();
    const isStaff = localStorage.getItem('isStaff') === 'true';
    const isSuperuser = localStorage.getItem('isSuperuser') === 'true';
    if (isStaff || isSuperuser) {
      return true;
    }
    return role === 'company_admin' || role === 'company_yonetici' || role === 'company_operasyoncu';
  }

  private parseNumberParam(value: string | string[] | undefined, fallback: number): number {
    if (typeof value !== 'string') {
      return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private syncPaginationFromFilters(): void {
    const page = this.filters().page ?? 1;
    const pageSize = this.filters().page_size ?? this.rows;
    this.rows = pageSize;
    this.first = (page - 1) * pageSize;
  }

  private normalizePaginatedResults(
    response: PaginatedResponse<PaymentBankAccount> | PaymentBankAccount[],
  ): PaymentBankAccount[] {
    if (Array.isArray(response)) {
      return response;
    }
    return response.results ?? [];
  }

  private resolveTotalCount(
    response: PaginatedResponse<PaymentBankAccount> | PaymentBankAccount[],
    fallback: number,
  ): number {
    if (Array.isArray(response)) {
      return response.length;
    }
    return response.count ?? fallback;
  }
}
