import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
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
  ],
  templateUrl: './bank-accounts.component.html',
  styleUrls: ['./bank-accounts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService, ConfirmationService],
})
export class BankAccountsComponent implements OnInit {
  private readonly service = inject(BankAccountService);
  private readonly fb = inject(FormBuilder);
  private readonly messages = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly commonService = inject(CommonService);

  readonly accounts = signal<PaymentBankAccount[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly dialogVisible = signal(false);
  readonly dialogMode = signal<DialogMode>('create');
  readonly formSubmitting = signal(false);
  readonly editingAccount = signal<PaymentBankAccount | null>(null);

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
    void this.loadAccounts();
  }

  async loadAccounts(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const accounts = await firstValueFrom(this.service.list(this.filters()));
      this.accounts.set(accounts);
    } catch (error) {
      console.error('Failed to load bank accounts', error);
      this.error.set('Unable to load bank accounts.');
    } finally {
      this.loading.set(false);
    }
  }

  openCreateDialog(): void {
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

    return {
      method,
      currency,
      is_active,
    };
  }

  openEditDialog(account: PaymentBankAccount): void {
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
    const account = this.accounts().find(item => item.id === accountId);
    if (!account) {
      return;
    }
    this.confirmDelete(account);
  }

  confirmDelete(account: PaymentBankAccount): void {
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
}
